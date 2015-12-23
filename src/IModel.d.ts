declare module resource {

  /**
   * @interafce IModel モデル
   */
  export interface IModel {

    promise: JQueryPromise<IModel>;
    resolved: boolean;

    toJSON: any;
  }
}
