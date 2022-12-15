declare namespace Definitions {
  export type CreateFunctionDto = {
    name?: string /* Function name is unique in the application */;
    description?: string;
    websocket?: boolean;
    methods?: string[];
    code?: string /* The source code of the function */;
  };

  export type UpdateFunctionDto = {
    description?: string;
    websocket?: boolean;
    methods?: string[];
    code?: string /* The source code of the function */;
  };

  export type CompileFunctionDto = {
    code?: string /* The source code of the function */;
  };

  export type CreateApplicationDto = {
    name?: string;
    state?: string;
    region?: string;
    bundleName?: string;
    runtimeName?: string;
  };

  export type UpdateApplicationDto = {
    name?: string;
    state?: string;
  };

  export type CreateWebsiteDto = {};

  export type UpdateWebsiteDto = {};

  export type CreateCollectionDto = {
    name?: string;
  };

  export type UpdateCollectionDto = {
    validatorSchema?: {};
    validationLevel?: string;
  };

  export type CreatePolicyDto = {};

  export type UpdatePolicyDto = {};

  export type CreateBucketDto = {
    shortName?: string /* The short name of the bucket which not contain the appid */;
    policy?: string;
    storage?: string /* The storage capacity of the bucket: &#34;1Gi&#34;, &#34;0.5Gi&#34;, &#34;100Gi&#34; */;
  };

  export type UpdateBucketDto = {
    policy?: string;
    storage?: string /* The storage capacity of the bucket: &#34;1Gi&#34;, &#34;0.5Gi&#34;, &#34;100Gi&#34; */;
  };
}

declare namespace Paths {
  namespace AppControllerGetRegions {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace AppControllerGetRuntimes {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace AppControllerGetBundles {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace FunctionControllerCreate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.CreateFunctionDto;

    export type Responses = any;
  }

  namespace FunctionControllerFindAll {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace FunctionControllerFindOne {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace FunctionControllerUpdate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.UpdateFunctionDto;

    export type Responses = any;
  }

  namespace FunctionControllerRemove {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace FunctionControllerCompile {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.CompileFunctionDto;

    export type Responses = any;
  }

  namespace ApplicationControllerCreate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.CreateApplicationDto;

    export type Responses = any;
  }

  namespace ApplicationControllerFindAll {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace ApplicationControllerFindOne {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace ApplicationControllerUpdate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.UpdateApplicationDto;

    export type Responses = any;
  }

  namespace ApplicationControllerRemove {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace WebsitesControllerCreate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.CreateWebsiteDto;

    export type Responses = any;
  }

  namespace WebsitesControllerFindAll {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace WebsitesControllerFindOne {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace WebsitesControllerUpdate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.UpdateWebsiteDto;

    export type Responses = any;
  }

  namespace WebsitesControllerRemove {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace AuthControllerGetSigninUrl {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace AuthControllerGetSignupUrl {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace AuthControllerCode2token {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace AuthControllerGetProfile {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace CollectionControllerCreate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.CreateCollectionDto;

    export type Responses = any;
  }

  namespace CollectionControllerFindAll {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace CollectionControllerFindOne {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace CollectionControllerUpdate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.UpdateCollectionDto;

    export type Responses = any;
  }

  namespace CollectionControllerRemove {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace PolicyControllerCreate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.CreatePolicyDto;

    export type Responses = any;
  }

  namespace PolicyControllerFindAll {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace PolicyControllerFindOne {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace PolicyControllerUpdate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.UpdatePolicyDto;

    export type Responses = any;
  }

  namespace PolicyControllerRemove {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace DatabaseControllerProxy {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace BucketControllerCreate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.CreateBucketDto;

    export type Responses = any;
  }

  namespace BucketControllerFindAll {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace BucketControllerFindOne {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace BucketControllerUpdate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.UpdateBucketDto;

    export type Responses = any;
  }

  namespace BucketControllerRemove {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace LogControllerGetLogs {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }
}
