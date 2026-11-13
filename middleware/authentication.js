const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');

// async — бо чекаємо на БД; помилки до errorHandler доносить express-async-errors
const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) { // формат: 'Authorization: Bearer <token>'
    throw new UnauthenticatedError('Authorization invalid');
  }

  const token = authHeader.split('Bearer ')[1]; // [0] — порожній рядок, [1] — сам токен

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET); // перевіряє підпис і exp; повертає payload
  } catch (error) { // невалідний/прострочений токен — 401, а не 500 від jwt
    throw new UnauthenticatedError('Invalid credentials');
  }

  // токен валідний, але юзера могли видалити — перевіряємо, що він ще існує в БД
  const user = await User.findById(payload.userId).select('-password'); // у payload поле userId, не id; '-password' — без хешу
  if (!user) {
    throw new UnauthenticatedError('Invalid credentials');
  }

  req.user = { userId: user._id, name: user.name }; // та сама форма, що й раніше — контролери jobs на неї розраховують
  next(); // поза try — інакше помилку з наступних middleware зловив би наш catch
}

module.exports = auth;
