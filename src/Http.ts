module resource {
  'use strict';

  /**
   * @class Http HTTP通信
   */
  export class Http {

    static interceptors: IHTTPInterceptor[] = [];

    /**
     * @function execute 通信処理を行う。
     * @param {{}} params
     * @returns {JQueryPromise}
     */
    static execute(params: {}): JQueryPromise<any> {

      var options = $.extend({}, params);
      options.dataType = 'json';

      options.type = options.method;
      delete options.method;

      var promise = $.Deferred().resolve(options).promise();
      for (var i = 0; i < Http.interceptors.length; i ++)
        promise = promise.then(Http.interceptors[i].request, Http.interceptors[i].requestError);
      promise = promise.then((o: any) => $.ajax(o));
      for (var j = Http.interceptors.length - 1; j >= 0; j ++)
        promise = promise.then(Http.interceptors[i].response, Http.interceptors[i].responseError);

      return promise;
    }
  }

  /**
   * @interface IHTTPInterceptor HTTP通信のインターセプタ
   */
  interface IHTTPInterceptor {

    request: (options: any) => JQueryPromise<any>|void;
    requestError: (options: any) => JQueryPromise<any>|void;
    response: (data: any, textStatus: string, jqXHR: JQueryXHR) => JQueryPromise<any>|void;
    responseError: (jqXHR: JQueryXHR, textStatus: string, errorThrown: any) => JQueryPromise<any>|void;
  }
}
