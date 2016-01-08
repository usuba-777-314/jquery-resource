/// <reference path="Resource.ts" />
/// <reference path="Http.ts" />

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

(($: JQueryStatic) => {

  $.resource = {
    init: resource.Resource.init,
    defaultMode: resource.Resource.defaultMode,
    railsMode: resource.Resource.railsMode,
    http: resource.Http
  };

  Object.defineProperty($.resource, 'defaultActions', {
    get: () => resource.Resource.defaultActions,
    set: (actions: resource.IActions) => resource.Resource.defaultActions = actions,
    enumerable: true,
    configurable: true
  });
})(jQuery);
