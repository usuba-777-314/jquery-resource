/*!
 * jquery-resource v0.0.0 - Support for RESTful.
 * Copyright 2015 Hironobu Igawa
 * license MIT
 */
var resource;
(function (resource) {
    'use strict';
    /**
     * @class Http HTTP通信
     */
    var Http = (function () {
        function Http() {
        }
        /**
         * @function execute 通信処理を行う。
         * @param {{}} params
         * @returns {JQueryPromise}
         */
        Http.execute = function (params) {
            var options = $.extend({}, params);
            options.dataType = 'json';
            options.type = options.method;
            delete options.method;
            var promise = $.Deferred().resolve(options).promise();
            for (var i = 0; i < Http.interceptors.length; i++)
                promise = promise.then(Http.interceptors[i].request, Http.interceptors[i].requestError);
            promise = promise.then(function (o) { return $.ajax(o); });
            for (var j = Http.interceptors.length - 1; j >= 0; j++)
                promise = promise.then(Http.interceptors[i].response, Http.interceptors[i].responseError);
            return promise;
        };
        Http.interceptors = [];
        return Http;
    })();
    resource.Http = Http;
})(resource || (resource = {}));
var resource;
(function (resource_1) {
    'use strict';
    /**
     * @class Resource リソース
     */
    var Resource = (function () {
        /**
         * @constructor
         * @param {IModelClass<T>} modelClass
         * @param {string} url
         * @param {IActions} actions
         */
        function Resource(modelClass, url, actions) {
            this.url = url;
            this.modelClass = function Model(params) {
                var _this = this;
                modelClass.call(this, params);
                if (params) {
                    $.each(params, function (k, v) { return _this[k] = v; });
                }
            };
            this.modelClass.prototype = Object.create(modelClass.prototype);
            this.actions = $.extend({}, Resource.defaultActions, actions);
        }
        /**
         * @method static defaultMode デフォルトモードに切り替える。
         */
        Resource.defaultMode = function () {
            Resource.defaultActions = {
                "get": { method: "GET" },
                "query": { method: "GET", arrayFlg: true },
                "create": { method: "POST" },
                "update": { method: "PUT" },
                "destroy": { method: "DELETE" },
            };
        };
        /**
         * @method static railsMode Railsモードに切り替える。
         */
        Resource.railsMode = function () {
            Resource.defaultActions = {
                "get": { method: "GET" },
                "query": { method: "GET", arrayFlg: true },
                "create": { method: "POST" },
                "update": { method: "POST", params: { _method: "PUT" } },
                "destroy": { method: "POST", params: { _method: "DELETE" } },
            };
        };
        /**
         * @method static init リソースの初期化を行う。
         * @param {IModelClass<IModel>} modelClass
         * @param {string} url
         * @param {IActions} actions
         */
        Resource.init = function (modelClass, url, actions) {
            var resource = new Resource(modelClass, url, actions);
            resource.initConstructor();
            resource.initActions();
            resource.initToJSON();
            return resource.modelClass;
        };
        /**
         * @method initConstructor コンストラクタを初期化する。
         */
        Resource.prototype.initConstructor = function () {
            var _this = this;
            Object.defineProperty(this.modelClass, 'constructor', {
                value: function (params) { return _this.generateModel(params); },
                enumerable: false,
                writable: true,
                configurable: true
            });
        };
        /**
         * @method setActions アクションを初期化する。
         */
        Resource.prototype.initActions = function () {
            var _this = this;
            var prototype = this.modelClass.prototype;
            $.each(this.actions, function (actionName) {
                var action = _this.generateAction(actionName);
                _this.modelClass[actionName] = function (p) { return action(null, p); };
                prototype[actionName] = function (p) { return action(this, p); };
            });
        };
        /**
         * @method initToJSON JSON変換関数の初期化を行う。
         */
        Resource.prototype.initToJSON = function () {
            var prototype = this.modelClass.prototype;
            prototype.toJSON = function () {
                var _this = this;
                var json = {};
                $.each(this, function (key, value) {
                    if (!_this.hasOwnProperty(key))
                        return;
                    if (key === 'promise' || key === 'resolved')
                        return;
                    json[key] = value;
                });
                return json;
            };
        };
        /**
         * @method static copy オブジェクトの値をモデルにコピーする。
         *    モデルが指定されていない場合、新しくモデルを生成して返却する。
         * @param {{}} src
         * @param {T} dest
         * @returns {T}
         */
        Resource.prototype.copy = function (src, dest) {
            if (dest) {
                $.each(dest, function (key) {
                    if (!dest.hasOwnProperty(key))
                        return;
                    if (key === 'promise' || key === 'resolved')
                        return;
                    delete dest[key];
                });
            }
            var model = dest || this.generateModel();
            $.each(src, function (k, v) { return model[k] = v; });
            return model;
        };
        /**
         * @method static generateAction アクションを生成する。
         * @param {string} actionName
         * @returns {(data?: T, params?: any) => T|IModelArray<T>|JQueryPromise<T|IModelArray<T>>}
         */
        Resource.prototype.generateAction = function (actionName) {
            var _this = this;
            var action = this.actions[actionName];
            return function (model, params) {
                var instanceCallFlg = !!model;
                var val = instanceCallFlg ? model : (action.arrayFlg ? [] : _this.generateModel());
                var promise = resource_1.Http.execute(_this.generateHttpConfig(action, model, params))
                    .done(function (data) {
                    if (action.arrayFlg) {
                        data.forEach(function (v) { return val.push(_this.generateModel(v)); });
                    }
                    else {
                        _this.copy(data, val);
                    }
                })
                    .always(function () { return val.resolved = true; })
                    .done(function () { return $.Deferred().resolve(val).promise(); });
                if (!instanceCallFlg) {
                    val.promise = promise;
                    val.resolved = false;
                    return val;
                }
                return promise;
            };
        };
        /**
         * @method generateHttpConfig HTTP設定を生成して返却する。
         * @param {IAction} action
         * @param {T} model
         * @param {{}} params
         * @returns {Object}
         */
        Resource.prototype.generateHttpConfig = function (action, model, params) {
            var httpConfig = {};
            $.each(action, function (key, value) {
                if (key === 'url' || key === 'arrayFlg')
                    return;
                httpConfig[key] = value;
            });
            var templateURL = action.url || this.url;
            var data = $.extend({}, action.params, model && model.toJSON(), params);
            var paramKeys = resource_1.Router.getURLParamKeys(templateURL);
            httpConfig.url = resource_1.Router.generateURL(templateURL, paramKeys, data);
            httpConfig.data = this.excludeParams(data, paramKeys);
            return httpConfig;
        };
        /**
         * @method excludeParams パラメータから指定のキーを除外して返却する。
         * @param {{}} params
         * @param {string[]} paramKeys
         * @returns {{}} result
         */
        Resource.prototype.excludeParams = function (params, paramKeys) {
            var result = $.extend({}, params);
            paramKeys.forEach(function (k) { return delete result[k]; });
            return result;
        };
        /**
         * @method generateModel モデルを生成して返却する。
         * @param {{}} params
         * @returns {T}
         */
        Resource.prototype.generateModel = function (params) {
            return new this.modelClass(params);
        };
        return Resource;
    })();
    resource_1.Resource = Resource;
    Resource.defaultMode();
})(resource || (resource = {}));
/// <reference path="Resource.ts" />
var resource;
(function (resource) {
    'use strict';
    $.resource = {
        init: resource.Resource.init,
        http: resource.Http
    };
})(resource || (resource = {}));
var resource;
(function (resource) {
    /**
     * @class Router ルータ
     */
    var Router = (function () {
        function Router() {
        }
        /**
         * @method getUrlParams URLパラメータキーを返却する。
         * @param {string} template
         * @returns {string[]}
         */
        Router.getURLParamKeys = function (template) {
            return template.split(/\W/)
                .filter(function (p) { return !new RegExp("^\\d+$").test(p); })
                .filter(function (p) { return !!p; })
                .filter(function (p) { return new RegExp("(^|[^\\\\]):" + p + "(\\W|$)").test(template); });
        };
        /**
         * @method generateURL URLを生成して返却する。
         *    (例1)
         *    template = "/users/:userId", paramKeys = ['userId'], params = {userId: "1"}の場合、
         *    "/users/1"を返却する。
         *    (例2)
         *    template = "/users/:userId", paramKeys = ['userId'], params = {}の場合、
         *    "/users"を返却する。
         *    (例3)
         *    template = "/users/:userId.json", paramKeys = ['userId'], params = {}の場合、
         *    "/users.json"を返却する。
         * @param {string} template
         * @param {string[]} paramKeys
         * @param {{}} params
         * @returns {string}
         */
        Router.generateURL = function (template, paramKeys, params) {
            if (!paramKeys.length) {
                return template;
            }
            var url = paramKeys.reduce(function (u, k) { return params[k] ? Router.replace(u, k, params[k]) : Router.exclude(u, k); }, template);
            return url.replace(/\/\.json$/, '.json');
        };
        /**
         * @method replace 対象キーを置換して返却する。
         *    (例)
         *    template = "/users/:userId", key = "userId", val = "1"の場合、
         *    "/users/1"を返却する。
         * @param {string} template
         * @param {string} key
         * @param {any} val
         * @returns {string}
         */
        Router.replace = function (template, key, val) {
            return template.replace(new RegExp(":" + key + "(\\W|$)", "g"), function (m, p1) { return Router.encodeURI(val) + p1; });
        };
        /**
         * @method exclude 対象キーをURLから除外して返却する。
         *    (例)
         *    template = "/users/:userId", key = "userId"の場合、
         *    "/users/"を返却する。
         *    (例2)
         *    template = "/users/:userId/name", key = "userId"の場合、
         *    "/users/name"を返却する。
         *    (例3)
         *    template = "/users/:userId:name", key = "userId"の場合、
         *    "/users/:name"を返却する。
         * @param {string} template
         * @param {string} key
         * @returns {string}
         */
        Router.exclude = function (template, key) {
            return template.replace(new RegExp("(\/?):" + key + "(\\W|$)", "g"), function (match, leadingSlashes, tail) {
                return tail.charAt(0) === '/'
                    ? tail
                    : leadingSlashes + tail;
            });
        };
        /**
         * @method encodeURI URLエンコードして返却する。
         * @param {string} val
         * @returns {string}
         */
        Router.encodeURI = function (val) {
            return encodeURIComponent(val)
                .replace(/%40/gi, '@')
                .replace(/%3A/gi, ':')
                .replace(/%24/gi, '$')
                .replace(/%2C/gi, ',')
                .replace(/%26/gi, '&')
                .replace(/%3D/gi, '=')
                .replace(/%2B/gi, '+');
        };
        return Router;
    })();
    resource.Router = Router;
})(resource || (resource = {}));
