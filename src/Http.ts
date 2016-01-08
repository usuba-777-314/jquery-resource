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
      var promise = $.Deferred().resolve(options).promise();

      for (var i = 0; i < Http.interceptors.length; i ++)
        promise = promise.then(Http.interceptors[i].request, Http.interceptors[i].requestError);

      promise = promise.then((options: any) => {

        options.dataType = 'json';
        options.type = options.method;
        delete options.method;

        return $.ajax(options)
      });

      for (var j = Http.interceptors.length - 1; j >= 0; j --)
        promise = promise.then(Http.interceptors[j].response, Http.interceptors[j].responseError);

      return promise;
    }
  }

  /**
   * @interface IHTTPInterceptor HTTP通信のインターセプタ
   */
  interface IHTTPInterceptor {

    request: (options: any) => JQueryPromise<any>;
    requestError: (options: any) => JQueryPromise<any>;
    response: (data: any, textStatus: string, jqXHR: JQueryXHR) => JQueryPromise<any>;
    responseError: (jqXHR: JQueryXHR, textStatus: string, errorThrown: any) => JQueryPromise<any>;
  }
}
