import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { KeycloakStoreService } from "../services/store.service";
import { KEYCLOAK_CONFIG_TOKEN } from "../tokens/config.token";
import { SpecificKeycloakConfig } from "../types/config.type";

/* eslint-disable @tseslint/typedef */
/**
 * HTTP Header for skipping the Interceptor
 */
export const SKIP_KEYCLOAK_INTERCEPTOR = "skip-keycloak-interceptor" as const;
/* eslint-enable @tseslint/typedef */
/**
 * Interceptor for appending relevant HTTP Headers to HTTP Request
 */
@Injectable({
  providedIn: "root"
})
export class KeycloakInterceptor implements HttpInterceptor {
  private readonly _keycloakConfig: SpecificKeycloakConfig = inject(KEYCLOAK_CONFIG_TOKEN);

  private readonly _keycloakStoreService: KeycloakStoreService = inject(KeycloakStoreService);

  public intercept (httpRequest: HttpRequest<unknown>, httpHandler: HttpHandler): Observable<HttpEvent<unknown>> {
    if (httpRequest.headers.has(SKIP_KEYCLOAK_INTERCEPTOR)) {
      const httpHeaders: HttpHeaders = httpRequest.headers[ "delete" ](SKIP_KEYCLOAK_INTERCEPTOR);
      /* eslint-disable-next-line @tseslint/no-shadow */
      const clonedHttpRequest: HttpRequest<unknown> = httpRequest.clone({ headers: httpHeaders });

      return httpHandler.handle(clonedHttpRequest);
    }

    const clonedHttpRequest: HttpRequest<unknown> = httpRequest.clone({ setHeaders:
      this._keycloakConfig.useEmailAsCurrentUser && this._keycloakStoreService.email
        ? { Authorization: `Bearer ${ this._keycloakStoreService.accessToken }`, currentUser: this._keycloakStoreService.email }
        : { Authorization: `Bearer ${ this._keycloakStoreService.accessToken }` } });

    return httpHandler.handle(clonedHttpRequest);
  }
}
