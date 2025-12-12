import { ValueProvider } from "@angular/core";
import { KEYCLOAK_CONFIG_TOKEN } from "../tokens/config.token";
import { SpecificKeycloakConfig } from "../types/config.type";

/**
 * Provider for injecting Keycloak configuration
 * @category Providers
 * @param keycloakConfig - Keycloak configuration
 * @returns `ValueProvider` for Dependency Injection
 *
 * @since 1.0.0
 * @author Simon Kovtyk
 */
export const provideKeycloakConfig = (keycloakConfig: SpecificKeycloakConfig): ValueProvider => ({
  provide: KEYCLOAK_CONFIG_TOKEN,
  useValue: keycloakConfig,
  multi: false
});
