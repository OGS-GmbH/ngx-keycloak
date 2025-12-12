import { InjectionToken } from "@angular/core";
import { SpecificKeycloakConfig } from "../types/config.type";

/**
 * InjectionToken for Keycloak-related configurations
 * @category Token
 * @readonly
 */
export const KEYCLOAK_CONFIG_TOKEN: InjectionToken<SpecificKeycloakConfig> = new InjectionToken<SpecificKeycloakConfig>("keycloak-config");
