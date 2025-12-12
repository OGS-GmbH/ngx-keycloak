import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { ClassProvider } from "@angular/core";
import { KeycloakInterceptor } from "../interceptors/auth.interceptor";
import { KeycloakTokenInvalidInterceptor } from "../interceptors/token-invalid.interceptor";

/**
 * Provider for Keycloak HTTP interceptor
 * @category Providers
 * @returns `ClassProvider` for Dependency Injection
 *
 * @since 1.0.0
 * @author Simon Kovtyk
 */
export const provideKeycloakInterceptor = (): ClassProvider => ({
  provide: HTTP_INTERCEPTORS,
  useClass: KeycloakInterceptor,
  multi: true
});
/**
 * Provider for Keycloak Token Invalid HTTP interceptor
 * @category Providers
 * @returns `ClassProvider` for Dependency Injection
 *
 * @since 1.0.0
 * @author Simon Kovtyk
 */
export const provideKeycloakTokenInvalidInterceptor = (): ClassProvider => ({
  provide: HTTP_INTERCEPTORS,
  useClass: KeycloakTokenInvalidInterceptor,
  multi: true
});
