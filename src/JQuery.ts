interface JQueryStatic {

  resource: (modelClass: resource.IModelClass<resource.IModel>,
             url: string,
             actions?: resource.IActions) => resource.IModelClass<resource.IModel>;
}

module resource {
  'use strict';

  $.resource = (modelClass: IModelClass<IModel>,
                url: string,
                actions?: IActions) => Resource.init(modelClass, url, actions);
}
