declare module resource {

  /**
   * @interface IModel モデル
   */
  export interface IModel {

    promise: JQueryPromise<IModel>;
    resolved: boolean;

    toJSON: any;
  }
}
