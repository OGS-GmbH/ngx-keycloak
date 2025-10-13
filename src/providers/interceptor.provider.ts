import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { ClassProvider } from "@angular/core";
import { KeycloakInterceptor } from "../interceptors/auth.interceptor";
import { KeycloakTokenInvalidInterceptor } from "../interceptors/token-invalid.interceptor";

export const provideKeylcoakInterceptor = (): ClassProvider => ({
  provide: HTTP_INTERCEPTORS,
  useClass: KeycloakInterceptor,
  multi: true
});
export const provideKeycloakTokenInvalidInterceptor = (): ClassProvider => ({
  provide: HTTP_INTERCEPTORS,
  useClass: KeycloakTokenInvalidInterceptor,
  multi: true
});
