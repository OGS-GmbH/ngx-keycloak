import { InjectionToken } from "@angular/core";

/**
 * InjectionToken for Keycloak HTTP configurations
 * @category Token
 * @readonly
 */
export const KEYCLOAK_HTTP_CONFIG: InjectionToken<string> = new InjectionToken<string>("keycloak-http-config");
