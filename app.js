require('dotenv').config();
require('express-async-errors');

// extra security packages
const helmet = require('helmet'); // безпечні HTTP-заголовки (CSP, X-Frame-Options, без X-Powered-By)
const cors = require('cors'); // дозволяє браузерні запити з інших доменів (фронтенд)
const xss = require('xss-clean'); // екранує HTML/<script> у req.body, query, params
const rateLimiter = require('express-rate-limit'); // ліміт запитів з одного IP — захист від перебору/спаму

// Swagger
const swaggerUI = require('swagger-ui-express'); // віддає готовий HTML/JS інтерфейс документації
const YAML = require('yamljs'); // swagger-ui чекає JS-об'єкт, а в нас YAML-файл
const swaggerDocument = YAML.load('./swagger.yaml'); // шлях від cwd — npm start запускається з кореня

const express = require('express');
const app = express();

// connectDB
const connectDB = require('./db/connect'); // обгортка над mongoose.connect(url)

// auth
const authenticate = require('./middleware/authentication');

// routers
const authRouter = require('./routes/auth');
const jobRouter = require('./routes/jobs');

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.set('trust proxy', 1); // 1 проксі перед нами (Render/Heroku): req.ip береться з X-Forwarded-For
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // вікно 15 хвилин
    max: 100, // до 100 запитів з IP за вікно (у express-rate-limit 7 — limit)
  })
); // першим — відсікаємо зайві запити ще до парсингу JSON
app.use(express.json());
app.use(helmet()); // до роутів — заголовки отримує кожна відповідь, навіть 404
app.use(cors()); // без опцій — origin '*'; у проді краще cors({ origin: 'https://...' })
app.use(xss()); // після express.json() — чистити можна лише вже розпарсений body

// корінь — щоб хостинг/браузер на / бачили, що сервер живий (інакше 404 від notFound)
app.get('/', (req, res) => {
  res.send('<h1>Jobs API</h1><a href="/api-docs">Documentation</a>');
});
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument)); // serve — статика UI, setup — сторінка з нашою специфікацією

// routes
app.use('/api/v1/auth', authRouter); // публічні: register / login
app.use('/api/v1/jobs', authenticate, jobRouter); // authenticate стоїть перед усіма jobs-маршрутами

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI); // спершу БД, потім listen — без БД сервер не стартує
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
