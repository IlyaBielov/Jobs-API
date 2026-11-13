const User = require('../models/User')
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors'); // барел errors/index.js — усі класи з одного місця


const register = async (req, res, next) => {
  const user = await User.create({ ...req.body }); // валідація схеми + pre('save') хешує пароль

  const token = user.createJWT() // логіка токена живе в моделі — контролер тонкий
  res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token }); // 201; без пароля — лише name і token; frontend читає user.name
}

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) { // 400 — клієнт не надіслав потрібні поля
      throw new BadRequestError('Please enter a valid email or password');
  }

  const user = await User.findOne({ email }); // пароль у findOne не передаємо — у БД лише хеш

  if (!user) { // те саме повідомлення, що й для пароля — не підказуємо, які email існують
      throw new UnauthenticatedError('Invalid credentials');
  }

  const isPasswordValid = await user.comparePassword(password); // bcrypt хешує введене і порівнює з хешем
  if (!isPasswordValid) {
    throw new UnauthenticatedError('Invalid credentials');
  }

  const token = user.createJWT() // новий токен при кожному логіні — exp знову JWT_LIFETIME
  res.status(StatusCodes.OK).json({ user: { name: user.name }, token }); // та сама форма, що й у register
}


module.exports = {
  register,
  login
}
