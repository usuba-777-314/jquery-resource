var UsersController = function UsersController() {

  this.users = [];
};

UsersController.prototype.index = function(req, res) {

  console.log('request index.');

  res.send(this.users.filter(function(u) { return !!u; }));
};

UsersController.prototype.show = function(req, res) {

  console.log('request show. id=' + req.params.id);

  res.send(this.users[req.params.id - 1]);
};

UsersController.prototype.create = function(req, res) {

  console.log('request create.');

  var id = this.users.length + 1;
  var user = this.users[id - 1] = {
    userId: id,
    name: req.body.name,
    age: req.body.age
  };

  res.send(user);
};

UsersController.prototype.update = function(req, res) {

  console.log('request update. id=' + req.params.id);

  var id = req.params.id;
  var user = this.users[id - 1] = {
    userId: id,
    name: req.body.name,
    age: req.body.age
  };

  res.send(user);
};

UsersController.prototype.destroy = function(req, res) {

  console.log('request destroy. id=' + req.params.id);

  var id = req.params.id;
  var user = this.users[id - 1];
  this.users[id - 1] = undefined;

  res.send(user);
};

module.exports = new UsersController();
