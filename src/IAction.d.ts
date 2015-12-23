declare module resource {

  /**
   * @interface IAction アクション
   */
  interface IAction {

    url?: string;
    method?: string;
    params?: any;
    arrayFlg?: boolean;
  }
}
