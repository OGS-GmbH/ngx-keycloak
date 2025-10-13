import { KeycloakTokens } from "./token.type";

interface KeycloakGuardOptions {
  token?: KeycloakTokens;
  route?: string;
  reverse?: boolean;
}

export type {
  KeycloakGuardOptions
};
