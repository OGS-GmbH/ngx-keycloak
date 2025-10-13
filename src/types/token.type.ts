export type ParsedKeycloakToken = {
  exp: number;
  iat: number;
  jti: string;
  jss: string;
  sub: string;
  typ: string;
  azp: string;
  session_state: string;
  nbf: number;
  iss: string;
  auth_time: number;
  acr: string;
  "allowed-origins"?: string[] | null;
  scope: string;
  email_verified: boolean;
  name: string;
  sid: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
  aud: string[];
  realm_access: {
    roles: string[];
  };
  resource_access: Record<string, {
    roles: string[];
  }>;
};
export type KeycloakTokens = "refresh" | "access";
