declare module resource {

  /**
   * @interface IActions アクションの集まり
   */
  interface IActions {

    [action: string]: IAction;
  }
}
