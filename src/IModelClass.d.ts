declare module resource {

  /**
   * @interface IModelClass モデルクラス
   */
  export interface IModelClass<T extends IModel> {

    get?: (params?: any) => T;
    query?: (params?: any) => IModelArray<T>;
    create?: (params?: any) => T;
    update?: (params?: any) => T;
    destroy?: (params?: any) => T;

    new(params?: any): T;
  }
}
