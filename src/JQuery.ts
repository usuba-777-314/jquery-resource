/// <reference path="Resource.ts" />

interface JQueryStatic {

  resource: IResource;
}

interface IResource {

  init(modelClass: resource.IModelClass<resource.IModel>,
       url: string,
       actions?: resource.IActions): resource.IModelClass<resource.IModel>

  http: resource.Http;
}

module resource {
  'use strict';

  $.resource = {
    init: Resource.init,
    http: resource.Http
  };
}
