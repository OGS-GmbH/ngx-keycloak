import { KeycloakTokens } from "./api-response.type";

export type MultiKeycloakStorage = {
  email?: string | undefined;
  tokens?: KeycloakTokens | undefined;
};
export type SimpleKeycloakStorage = KeycloakTokens;
