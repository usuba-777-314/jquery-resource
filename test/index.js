$(function() {

  var User = function User() {};
  var userResource = $.resource.init(User, 'http://localhost:3001/users/:userId');

  var $canvas = $('#canvas');

  var indexController = function() {

    var scope = {};

    scope.showNew = function() {

      newController();
    };

    scope.show = function(user) {

      showController(user.userId);
    };

    scope.showEdit = function(user) {

      editController(user.userId);
    };

    scope.destroy = function(user) {

      user.destroy().then(scope.refresh);
    };

    scope.refresh = function() {

      scope.users = userResource.query();
      scope.users.promise.then(indexRender.bind(null, scope));
    };

    scope.refresh();
  };

  var indexRender = function(scope) {

    $canvas.empty();

    $('<button>New</button>')
      .on('click', scope.showNew)
      .appendTo($canvas);

    var $list = $('<ul>').appendTo($canvas);
    if (scope.users.length > 0) {
      scope.users.forEach(function(user) {

        var $row = $('<li>').appendTo($list);
        $row.append('<span>Id:' + user.userId + '</span>');
        $('<button>Show</button>')
          .on('click', scope.show.bind(null, user))
          .appendTo($row);
        $('<button>Edit</button>')
          .on('click', scope.showEdit.bind(null, user))
          .appendTo($row);
        $('<button>Delete</button>')
          .on('click', scope.destroy.bind(null, user))
          .appendTo($row);
      });
    } else {
      $list.append('<li>Not found.</li>');
    }
  };

  var showController = function(id) {

    var scope = {};

    scope.user = userResource.get({userId: id});

    scope.showIndex = function() {

      indexController();
    };

    scope.user.promise.then(showRender.bind(null, scope));
  };

  var showRender = function(scope) {

    $canvas.empty();

    $('<button>Index</button>')
      .on('click', scope.showIndex)
      .appendTo($canvas);

    $('<dl>')
      .append('<dt>Id</dt><dd>' + scope.user.userId + '</dd>')
      .append('<dt>Name</dt><dd>' + scope.user.name + '</dd>')
      .append('<dt>Age</dt><dd>' + scope.user.age + '</dd>')
      .appendTo($canvas);
  };

  var newController = function() {

    var scope = {};
    scope.user = new userResource({name: 'Taro Yamada', age: '19'});

    scope.showIndex = function() {

      indexController();
    };

    scope.create = function() {

      scope.user.name = scope.$nameInput.val();
      scope.user.age = Number(scope.$ageInput.val());

      scope.user.create().then(function(user) {

        showController(user.userId);
      });
    };

    newRender(scope);
  };

  var newRender = function(scope) {

    $canvas.empty();

    $('<button>Index</button>')
      .on('click', scope.showIndex)
      .appendTo($canvas);

    var $form = $('<form><dl></dl></form>')
      .on('submit', function(e) { e.preventDefault(); })
      .on('submit', scope.create)
      .appendTo($canvas);

    $('<dt>Name</dt>').appendTo($form);
    scope.$nameInput = $('<input type="text">').val(scope.user.name);
    $('<dd>').append(scope.$nameInput).appendTo($form);
    $('<dt>Age</dt>').appendTo($form);
    scope.$ageInput = $('<input type="number">').val(scope.user.age);
    $('<dd>').append(scope.$ageInput).appendTo($form);

    $('<button>Create</button>').appendTo($form);
  };

  var editController = function(id) {

    var scope = {};
    scope.user = userResource.get({userId: id});

    scope.showIndex = function() {

      indexController();
    };

    scope.update = function() {

      scope.user.name = scope.$nameInput.val();
      scope.user.age = Number(scope.$ageInput.val());

      scope.user.update().then(function(user) {

        showController(user.userId);
      });
    };

    scope.user.promise.then(editRender.bind(null, scope));
  };

  var editRender = function(scope) {

    $canvas.empty();

    $('<button>Index</button>')
      .on('click', scope.showIndex)
      .appendTo($canvas);

    var $form = $('<form><dl></dl></form>')
      .on('submit', function(e) { e.preventDefault(); })
      .on('submit', scope.update)
      .appendTo($canvas);

    $('<dt>Name</dt>').appendTo($form);
    scope.$nameInput = $('<input type="text">').val(scope.user.name);
    $('<dd>').append(scope.$nameInput).appendTo($form);
    $('<dt>Age</dt>').appendTo($form);
    scope.$ageInput = $('<input type="number">').val(scope.user.age);
    $('<dd>').append(scope.$ageInput).appendTo($form);

    $('<button>Update</button>').appendTo($form);
  };

  indexController();
});
