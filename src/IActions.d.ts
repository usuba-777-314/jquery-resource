declare module resource {

  /**
   * @interafce IActions アクションの集まり
   */
  interface IActions {

    [action: string]: IAction;
  }
}
