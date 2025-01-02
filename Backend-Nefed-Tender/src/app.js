import express from 'express';
import helmet from 'helmet';
import xss from 'xss-clean';
import compression from 'compression';
import cors from 'cors';
import httpStatus from 'http-status';
import config from './config/config2.js';
import morgan from './config/morgan.js';
import authLimiter from './middlewares/rateLimiter.js';
import routes from './routes/index.js';
import { errorConverter, errorHandler } from './middlewares/error.js';
import ApiError from './utils/ApiError.js';
import db from './models/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}
const corsOptions = {
  origin: '*', // Allows requests from any origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allows common HTTP methods
  allowedHeaders: '*', // Allows all headers
  credentials: false, // Disable credentials if requests are accepted from any origin
};

app.use(cors(corsOptions));

app.use('/Public', express.static(path.join(__dirname, '../Public')));


// set security HTTP headers


// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());


// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
// app.use(passport.initialize());
// passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('auth', authLimiter);
}

// v1 api routes
app.use('/', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

// intit DB
db.sequelize.sync();

export default app;
