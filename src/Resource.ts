module resource {
  'use strict';

  /**
   * @class Resource リソース
   */
  export class Resource<T extends IModel> {

    static defaultActions: IActions = {
      "get": {method: "GET"},
      "query": {method: "GET", arrayFlg: true},
      "create": {method: "POST"},
      "update": {method: "PUT"},
      "destroy": {method: "DELETE"}
    };

    modelClass: IModelClass<T>;

    private actions: IActions;

    /**
     * @constructor
     * @param {IModelClass<T>} modelClass
     * @param {string} url
     * @param {IActions} actions
     */
    constructor(modelClass: IModelClass<T>,
                private url: string,
                actions?: IActions) {

      this.modelClass = <any>function Model (params?: any) {

        modelClass.call(this, params);
        if (!params) return;

        Object.keys(params).forEach((key: string) => {

          if (!params.hasOwnProperty(key)) return;
          this[key] = params[key];
        });
      };

      this.modelClass.prototype = Object.create(modelClass.prototype);

      this.actions = $.extend({}, Resource.defaultActions, actions);
    }

    /**
     * @method static init リソースの初期化を行う。
     * @param {IModelClass<IModel>} modelClass
     * @param {string} url
     * @param {IActions} actions
     */
    static init(modelClass: IModelClass<IModel>,
                url: string,
                actions?: IActions): IModelClass<IModel> {

      var resource = new Resource(modelClass, url, actions);

      resource.initConstructor();
      resource.initActions();
      resource.initToJSON();

      return resource.modelClass;
    }

    /**
     * @method initConstructor コンストラクタを初期化する。
     */
    initConstructor() {

      Object.defineProperty(this.modelClass, 'constructor', {
        value: (params?: any) => this.generateModel(params),
        enumerable: false,
        writable: true,
        configurable: true
      });
    }

    /**
     * @method setActions アクションを初期化する。
     */
    initActions() {

      var prototype = this.modelClass.prototype;
      $.each(this.actions, (actionName: string) => {

        var action = this.generateAction(actionName);
        this.modelClass[actionName] = (p?: any) => action(null, p);
        prototype[actionName] = function(p?: any) { return action(this, p); };
      });
    }

    /**
     * @method initToJSON JSON変換関数の初期化を行う。
     */
    initToJSON() {

      var prototype = this.modelClass.prototype;
      prototype.toJSON = function() {

        var json = {};

        Object.keys(this).forEach((key: string) => {

          if (!this.hasOwnProperty(key)) return;
          if (key === 'promise' || key === 'resolved') return;
          json[key] = this[key];
        });

        return json;
      };
    }

    /**
     * @method static copy オブジェクトの値をモデルにコピーする。
     *    モデルが指定されていない場合、新しくモデルを生成して返却する。
     * @param {{}} src
     * @param {T} dest
     * @returns {T}
     */
    private copy(src: {}, dest?: T): T {

      if (dest) {
        $.each(dest, (key: string) => {

          if (!dest.hasOwnProperty(key)) return;
          if (key === 'promise' || key === 'resolved') return;
          delete dest[key];
        });
      }

      var model = dest || this.generateModel();
      $.each(src, (k: string, v: any) => model[k] = v);

      return model;
    }

    /**
     * @method static generateAction アクションを生成する。
     * @param {string} actionName
     * @returns {(data?: T, params?: any) => T|IModelArray<T>|JQueryPromise<T|IModelArray<T>>}
     */
    private generateAction(actionName: string): (model?: T, params?: any) => T|IModelArray<T>|JQueryPromise<any> {

      var action = this.actions[actionName];

      return (model?: T, params?: any) => {

        var instanceCallFlg = !!model;
        var val = instanceCallFlg ? model : (action.arrayFlg ? <IModelArray<T>>[] : this.generateModel());
        var promise = Http.execute(this.generateHttpConfig(action, model, params))
          .done((data: any) => {

            if (action.arrayFlg) {
              (<any[]>data).forEach((v: any) => (<IModelArray<T>>val).push(this.generateModel(v)));
            } else {
              this.copy(data, <T>val);
            }
          })
          .always(() => {

            if (!instanceCallFlg) (<T>val).resolved = true;
          })
          .then(() => val);

        if (!instanceCallFlg) {
          (<T|IModelArray<T>>val).promise = promise;
          (<T|IModelArray<T>>val).resolved = false;
          return val;
        }

        return promise;
      };
    }

    /**
     * @method generateHttpConfig HTTP設定を生成して返却する。
     * @param {IAction} action
     * @param {T} model
     * @param {{}} params
     * @returns {Object}
     */
    private generateHttpConfig(action: IAction, model?: T, params?: {}): Object {

      var httpConfig = <any>{};
      $.each(action, (key: string, value: any) => {

        if (key === 'url' || key === 'arrayFlg') return;
        httpConfig[key] = value;
      });

      var templateURL = action.url || this.url;
      var data = $.extend({}, action.params, model && model.toJSON(), params);
      var paramKeys = Router.getURLParamKeys(templateURL);
      httpConfig.url = Router.generateURL(templateURL, paramKeys, data);
      httpConfig.data = this.excludeParams(data, paramKeys);

      return httpConfig;
    }

    /**
     * @method excludeParams パラメータから指定のキーを除外して返却する。
     * @param {{}} params
     * @param {string[]} paramKeys
     * @returns {{}} result
     */
    private excludeParams(params: {}, paramKeys: string[]): {} {

      var result = $.extend({}, params);
      paramKeys.forEach((k: string) => delete result[k]);

      return result;
    }

    /**
     * @method generateModel モデルを生成して返却する。
     * @param {{}} params
     * @returns {T}
     */
    private generateModel(params?: {}): T {

      return new this.modelClass(params);
    }
  }
}
