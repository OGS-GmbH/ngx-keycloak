import { HttpConfig } from "@ogs-gmbh/ngx-http";
import { UpdateStrategy } from "../enums/update-strategy.enum";

export type GuardFallbackFn = () => unknown;
export type SpecificKeycloakConfig = {
  resource: string;
  realm: string;
  guardFallbackUrl?: string | undefined;
  reverseGuardFallbackUrl?: string | undefined;
  guardFallbackCallback?: GuardFallbackFn | undefined;
  reverseGuardFallbackCallback?: GuardFallbackFn | undefined;
  storageType: Storage;
  storageKey: string;
  useEmailAsCurrentUser?: boolean | undefined;
  timeout?: number | undefined;
  expirationOffset?: number | undefined;
  updateStrategy: UpdateStrategy;
};
/**
 * Type is used for defining Keycloak-specific data
 */
export type KeycloakConfig = {
  http: HttpConfig;
  keycloak: SpecificKeycloakConfig;
};
