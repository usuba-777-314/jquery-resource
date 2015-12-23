var express = require('express');
var bodyParser = require('body-parser');
var corser = require("corser");
var app = express();

var users = require('./users');

exports.start = function () {

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(corser.create());

  app.get('/users', users.index.bind(users));
  app.get('/users/:id', users.show.bind(users));
  app.post('/users/', users.create.bind(users));
  app.put('/users/:id', users.update.bind(users));
  app.delete('/users/:id', users.destroy.bind(users));

  app.listen(3001);
};
