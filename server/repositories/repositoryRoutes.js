var repositoryController = require('./repositoryController.js');


module.exports = function (app) {
  // app === repositoryRouter injected from middlware.js

  app.post('/create', repositoryController.create);
  app.get('/create', repositoryController.test);
  // app.post('/signup', userController.signup);
  // app.get('/signedin', userController.checkAuth);
};
