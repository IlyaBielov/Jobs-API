const { StatusCodes } = require('http-status-codes')

// 4 аргументи — так Express розпізнає error-middleware; сюди йде все, що кинули в async-контролерах
const errorHandlerMiddleware = (err, req, res, next) => {
  // дефолт: наші CustomAPIError несуть statusCode і message, решта — 500
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong, try again later',
  }

  // Validation Error: порушено правила схеми (required, maxlength, enum…)
  if (err.name === 'ValidationError') {
    customError.msg = Object.values(err.errors) // errors — об'єкт { поле: ValidatorError }
      .map((item) => item.message) // беремо наші тексти зі схеми, напр. 'Please provide company name'
      .join(', ')
    customError.statusCode = StatusCodes.BAD_REQUEST
  }

  // Duplicate Error: порушено unique-індекс (email) — це помилка MongoDB, тому code, а не name
  if (err.code === 11000) {
    customError.msg = `Duplicate value entered for ${Object.keys(err.keyValue)} field, please choose another value`
    customError.statusCode = StatusCodes.BAD_REQUEST
  }

  // Cast Error: id у URL не схожий на ObjectId (напр. /jobs/123) — для клієнта це "не знайдено"
  if (err.name === 'CastError') {
    customError.msg = `No item found with id: ${err.value}`
    customError.statusCode = StatusCodes.NOT_FOUND
  }

  // завжди одна форма { msg } — без сирого err, щоб не світити внутрішні деталі БД
  return res.status(customError.statusCode).json({ msg: customError.msg })
}

module.exports = errorHandlerMiddleware
