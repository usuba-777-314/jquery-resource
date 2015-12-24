var express = require('express');
var bodyParser = require('body-parser');
var cors = require("cors");
var app = express();

var users = require('./users');

exports.start = function () {

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cors());

  app.options('/users/:id', cors());
  app.get('/users', users.index.bind(users));
  app.get('/users/:id', users.show.bind(users));
  app.post('/users/', users.create.bind(users));
  app.put('/users/:id', cors(), users.update.bind(users));
  app.delete('/users/:id', cors(), users.destroy.bind(users));

  app.listen(3001);
};
