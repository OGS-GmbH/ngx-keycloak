export namespace GenericBody {
  export const CLIENT_ID: string = "client_id";
}
export namespace AuthBody {
  export const USERNAME: string = "username";
  export const PASSWORD: string = "password";
  export const GRANT_TYPE: string = "grant_type";
  export const REFRESH_TOKEN: string = "refresh_token";
  export namespace GrantTypes {
    export const GRANT_PASSWORD: string = "password";
    export const GRANT_REFRESH_TOKEN: string = "refresh_token";
  }
}
export namespace RevokeBody {
  export const TOKEN: string = "token";
  export const TOKEN_TYPE_HINT: string = "token_type_hint";
  export namespace TokenTypeHint {
    export const REFRESH_TOKEN: string = "refresh_token";
    export const ACCESS_TOKEN: string = "access_token";
  }
}
