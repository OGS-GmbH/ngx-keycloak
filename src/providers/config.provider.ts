import { ValueProvider } from "@angular/core";
import { KEYCLOAK_CONFIG_TOKEN } from "../tokens/config.token";
import { SpecificKeycloakConfig } from "../types/config.type";

export const provideKeycloakConfig = (keycloakConfig: SpecificKeycloakConfig): ValueProvider => ({
  provide: KEYCLOAK_CONFIG_TOKEN,
  useValue: keycloakConfig,
  multi: false
});
