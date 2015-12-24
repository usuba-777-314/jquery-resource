/// <reference path="Resource.ts" />

interface JQueryStatic {

  resource: typeof resource.Resource;
}

module resource {
  'use strict';

  $.resource = Resource;
}
