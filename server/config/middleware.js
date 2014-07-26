var morgan      = require('morgan'), // used for logging incoming request
    bodyParser  = require('body-parser'),
    helpers     = require('./helpers.js'); // our custom middleware


module.exports = function (app, express) {
  // Express 4 allows us to use multiple routers with their own configurations
  var userRouter = express.Router();
  var repositoryRouter = express.Router();

  app.use(morgan('dev'));
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use(express.static(__dirname + '/../../client'));


  app.use('/api/user', userRouter); // user user router for all user request

  // authentication middleware used to decode token and made available on the request
  app.use('/api/repositories', repositoryRouter); // user link router for link request
  app.use(helpers.errorLogger);
  app.use(helpers.errorHandler);

  // inject our routers into their perspective route files
  require('../users/userRoutes.js')(userRouter);
  require('../repositories/repositoryRoutes.js')(repositoryRouter);
};
