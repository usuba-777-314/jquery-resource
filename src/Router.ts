module resource {

  /**
   * @class Router ルータ
   */
  export class Router {

    /**
     * @method generateURL URLを生成して返却する。
     *    (例1)
     *    template = "/users/:userId", params = {userId: "1"}の場合、
     *    "/users/1"を返却する。
     *    (例2)
     *    template = "/users/:userId", params = {}の場合、
     *    "/users"を返却する。
     * @param {string} template
     * @param {any} params
     * @returns {string}
     */
    static generateURL(template: string, params: any): string {

      var url = template;

      var urlParams = url.split(/\W/)
        .filter((p: string) => !new RegExp("^\\d+$").test(p))
        .filter((p: string) => !!p)
        .filter((p: string) => new RegExp("(^|[^\\\\]):" + p + "(\\W|$)").test(url));

      urlParams.forEach(
        (k: string) => url = params[k] ? Router.replace(url, k, params[k]) : Router.exclude(url, k));

      return url;
    }

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
    private static replace(template: string, key: string, val: any): string {

      return template.replace(new RegExp(":" + key + "(\\W|$)", "g"),
        (m: string, p1: string) => Router.encodeURI(val) + p1);
    }

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
    private static exclude(template: string, key: string): string {

      return template.replace(new RegExp("(\/?):" + key + "(\\W|$)", "g"),
        (match: string, leadingSlashes: string, tail: string) => {

          return tail.charAt(0) === '/'
            ? tail
            : leadingSlashes + tail;
        });
    }

    /**
     * @method encodeURI URLエンコードして返却する。
     * @param {string} val
     * @returns {string}
     */
    private static encodeURI(val: string) {

      return encodeURIComponent(val)
        .replace(/%40/gi, '@')
        .replace(/%3A/gi, ':')
        .replace(/%24/gi, '$')
        .replace(/%2C/gi, ',')
        .replace(/%26/gi, '&')
        .replace(/%3D/gi, '=')
        .replace(/%2B/gi, '+');
    }
  }
}
