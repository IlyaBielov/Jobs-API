const User = require('../models/User')
const { StatusCodes } = require('http-status-codes');


const register = async (req, res, next) => {
  const user = await User.create({ ...req.body }); // валідація схеми + pre('save') хешує пароль
  const token = user.createJWT() // логіка токена живе в моделі — контролер тонкий

  res.status(StatusCodes.CREATED).json({ name: user.name, token }); // 201; без пароля — лише name і token
}

const login = async (req, res, next) => {
  res.send('login user')
}


module.exports = {
  register,
  login
}
