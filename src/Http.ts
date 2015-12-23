module resource {
  'use strict';

  /**
   * @function http 通信処理を行う。
   * @param {any} params
   * @returns {JQueryPromise}
   */
  export function http(params: any): JQueryXHR {

    var options = $.extend({}, params);
    options.dataType = 'json';

    options.type = options.method;
    delete options.method;

    return $.ajax(options);
  }
}
