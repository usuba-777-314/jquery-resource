/// <reference path="Resource.ts" />

interface JQueryStatic {

  resource: IResource;
}

interface IResource {

  defaultActions?: resource.IActions;

  init(modelClass: resource.IModelClass<resource.IModel>,
       url: string,
       actions?: resource.IActions): resource.IModelClass<resource.IModel>;

  defaultMode(): void;

  railsMode(): void;

  http: resource.Http;
}

module resource {
  'use strict';

  $.resource = {
    init: Resource.init,
    defaultMode: Resource.defaultMode,
    railsMode: Resource.railsMode,
    http: resource.Http
  };

  Object.defineProperty($.resource, 'defaultActions', {
    get: () => Resource.defaultActions,
    set: (actions: IActions) => Resource.defaultActions = actions,
    enumerable: true,
    configurable: true
  });
}
