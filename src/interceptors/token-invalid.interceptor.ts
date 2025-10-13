import { HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest, HttpStatusCode } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, Observable, switchMap, throwError } from "rxjs";
import { KeycloakService } from "../services/auth.service";
import { KEYCLOAK_CONFIG_TOKEN } from "../tokens/config.token";
import { SpecificKeycloakConfig } from "../types/config.type";
import { shouldUpdateByInterceptor } from "../utils/update";

/* eslint-disable-next-line @tseslint/typedef */
export const SKIP_KEYCLOAK_TOKEN_INVALID_INTERCEPTOR = "skip-keycloak-token-invalid-interceptor" as const;
@Injectable()
export class KeycloakTokenInvalidInterceptor implements HttpInterceptor {
  private _keycloakConfig: SpecificKeycloakConfig = inject(KEYCLOAK_CONFIG_TOKEN);

  private _keycloakService: KeycloakService = inject(KeycloakService);

  private _tryUpdate (httpRequest: HttpRequest<unknown>, httpHandler: HttpHandler, httpErrorResponse: HttpErrorResponse): Observable<HttpEvent<unknown>> {
    return httpErrorResponse.error === HttpStatusCode.Unauthorized
      ? this._keycloakService.forceUpdateAccessToken().pipe(
        switchMap((): Observable<HttpEvent<unknown>> => httpHandler.handle(httpRequest))
      )
      : throwError((): HttpErrorResponse => httpErrorResponse);
  }

  public intercept (httpRequest: HttpRequest<unknown>, httpHandler: HttpHandler): Observable<HttpEvent<unknown>> {
    if (httpRequest.headers.has(SKIP_KEYCLOAK_TOKEN_INVALID_INTERCEPTOR) || !shouldUpdateByInterceptor(this._keycloakConfig)) {
      const httpHeaders: HttpHeaders = httpRequest.headers[ "delete" ](SKIP_KEYCLOAK_TOKEN_INVALID_INTERCEPTOR);
      const clonedHttpRequest: HttpRequest<unknown> = httpRequest.clone({ headers: httpHeaders });

      return httpHandler.handle(clonedHttpRequest);
    }

    return httpHandler.handle(httpRequest).pipe(
      catchError((httpErrorResponse: HttpErrorResponse): Observable<HttpEvent<unknown>> =>
        this._tryUpdate(httpRequest, httpHandler, httpErrorResponse))
    );
  }
}
