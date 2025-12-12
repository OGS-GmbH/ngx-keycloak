import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { inject, Injectable, NgZone } from "@angular/core";
import { mergeHttpHeaders, HttpContentTypes, HttpHeaders as OwnHttpHeaders, HttpOptions } from "@ogs-gmbh/ngx-http";
import { BehaviorSubject, catchError, interval, map, mergeMap, Observable, ObservableInput, Subscription, tap, throwError, timeout, timer } from "rxjs";
import { AuthBody, GenericBody, RevokeBody } from "../constants/http-body";
import { SKIP_KEYCLOAK_INTERCEPTOR } from "../interceptors/auth.interceptor";
import { KEYCLOAK_CONFIG_TOKEN } from "../tokens/config.token";
import { KEYCLOAK_HTTP_CONFIG } from "../tokens/http.token";
import { KeycloakTokensResponse } from "../types/api-response.type";
import { SpecificKeycloakConfig } from "../types/config.type";
import { ParsedKeycloakToken } from "../types/token.type";
import { parseJWT } from "../utils/parse-jwt";
import { shouldUpdateByInterval } from "../utils/update";
import { KeycloakStoreService } from "./store.service";

/**
 * Service for handling Keycloak sessions
 * @category Services
 */
@Injectable({
  providedIn: "root"
})
export class KeycloakService {
  private readonly _isAuthorized: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private readonly _isAuthorized$: Observable<boolean> = this._isAuthorized.asObservable();

  private _accessTokenUpdateIntervalSubscription: Subscription | null = null;

  private _accessTokenUpdateTimerSubscription: Subscription | null = null;

  private readonly _httpClient: HttpClient = inject(HttpClient);

  private readonly _keycloakStoreService: KeycloakStoreService = inject(KeycloakStoreService);

  private readonly _keycloakHttpConfig: string = inject(KEYCLOAK_HTTP_CONFIG);

  private readonly _keycloakConfig: SpecificKeycloakConfig = inject(KEYCLOAK_CONFIG_TOKEN);

  private readonly _endpointToken: string = `${ this._keycloakHttpConfig }/realms/${ this._keycloakConfig.realm }/protocol/openid-connect/token`;

  private readonly _endpointLogout: string = `${ this._keycloakHttpConfig }/realms/${ this._keycloakConfig.realm }/protocol/openid-connect/logout`;

  private readonly _endpointRevoke: string = `${ this._keycloakHttpConfig }/realms/${ this._keycloakConfig.realm }/protocol/openid-connect/revoke`;

  private readonly _ngZone: NgZone = inject(NgZone);

  private readonly _delay: number = this._keycloakConfig.expirationOffset ?? 3000;

  private readonly _timeout: number = this._keycloakConfig.timeout ?? 3000;


  /**
   * Checks if a user is authorized by checking the state of the called workflow
   * @returns The current status of the potential authorization
   *
   * @author Simon Kovtyk
   * @since 1.0.0
   */
  public isAuthorized (): boolean {
    return this._isAuthorized.value;
  }

  /**
   * Checks if a user is authorized by checking the state of the called workflow
   * @returns An observable with the status of the potential authorization
   *
   * @author Simon Kovtyk
   * @since 1.0.0
   */
  public isAuthorized$ (): Observable<boolean> {
    return this._isAuthorized$;
  }

  /**
   * Setter for setting the authorization of
   * @param isAuthorized - Determine if the user is authorized
   *
   * @author Simon Kovtyk
   * @since 1.0.0
   */
  public setAuthorized (isAuthorized: boolean): void {
    this._isAuthorized.next(isAuthorized);
  }

  private _updateAccessTokenAfterRemainingTTLByInterval (httpHeaders?: HttpHeaders): void {
    const remainingTTLOfAccessToken: number = this._keycloakStoreService.remainingTTLOfAccessToken;
    const remainingTTLOfAccessTokenWithDelay: number = remainingTTLOfAccessToken - this._delay;

    this._ngZone.runOutsideAngular((): void => {
      this._accessTokenUpdateTimerSubscription = timer(remainingTTLOfAccessTokenWithDelay).pipe(
        tap((): void => {
          this._updateAccessToken().subscribe({
            next: (): void => {
              this._updateAccessTokenByInterval(httpHeaders);
            }
          });
        })
      )
        .subscribe();
    });
  }

  private _updateAccessTokenByInterval (httpHeaders?: HttpHeaders): void {
    const ttlOfAccessToken: number = this._keycloakStoreService.TTLOfAccessToken;
    const ttlOfAccessTokenWithDelay: number = ttlOfAccessToken - this._delay;

    this._ngZone.runOutsideAngular((): void => {
      this._accessTokenUpdateIntervalSubscription = interval(ttlOfAccessTokenWithDelay).pipe(
        tap((): void => {
          this._updateAccessToken(httpHeaders).subscribe();
        })
      )
        .subscribe();
    });
  }

  private _updateAccessToken (httpHeaders?: HttpHeaders): Observable<KeycloakTokensResponse> {
    let headers: HttpHeaders = new HttpHeaders({
      [ OwnHttpHeaders.CONTENT_TYPE ]: HttpContentTypes.Application.X_WWW_FORM_URLENCODED
    });

    if (httpHeaders)
      headers = mergeHttpHeaders(headers, httpHeaders);

    const body: URLSearchParams = new URLSearchParams();

    /* eslint-disable-next-line @tseslint/no-non-null-assertion */
    body.append(AuthBody.REFRESH_TOKEN, this._keycloakStoreService.refreshToken!);
    body.append(AuthBody.GRANT_TYPE, AuthBody.GrantTypes.GRANT_REFRESH_TOKEN);
    body.append(GenericBody.CLIENT_ID, this._keycloakConfig.resource);

    return this._httpClient.post<KeycloakTokensResponse>(this._endpointToken, body, {
      headers,
      observe: "body",
      responseType: "json"
    }).pipe(
      timeout(this._timeout),
      tap((responseBody: KeycloakTokensResponse): void => {
        this._keycloakStoreService.tokens = responseBody;
      }),
      catchError((): Observable<KeycloakTokensResponse> => {
        this._keycloakStoreService.clearTokens();
        this._isAuthorized.next(false);

        return throwError(() => new Error("Access Token could not be updated."));
      })
    );
  }

  private _revokeToken (tokenTypeHint: "refresh_token" | "access_token", token: string): Observable<HttpResponse<never>> {
    const headers: HttpHeaders = new HttpHeaders({
      [ OwnHttpHeaders.CONTENT_TYPE ]: HttpContentTypes.Application.X_WWW_FORM_URLENCODED,
      [ SKIP_KEYCLOAK_INTERCEPTOR ]: "true"
    });
    const body: URLSearchParams = new URLSearchParams();

    body.append(RevokeBody.TOKEN_TYPE_HINT, tokenTypeHint);
    body.append(RevokeBody.TOKEN, token);
    body.append(GenericBody.CLIENT_ID, this._keycloakConfig.resource);

    return this._httpClient.post<never>(this._endpointRevoke, body, {
      headers,
      observe: "response"
    });
  }

  /**
   * Revoke Refresh Token
   * @see https://datatracker.ietf.org/doc/html/rfc7009
   * @param overwriteRefreshToken - Overwrite the Refresh Token, that should be revoked.
   * @returns Observable that completes when the token has been revoked
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  public revokeRefreshToken (overwriteRefreshToken?: string): Observable<void> {
    const refreshToken: string | undefined = overwriteRefreshToken ?? this._keycloakStoreService.refreshToken;

    return refreshToken === undefined
      ? throwError((): Error => new Error("Expected refresh token to be valid."))
      : this._revokeToken("refresh_token", refreshToken).pipe(map((): void => void 0));
  }

  /**
   * Revoke Access Token
   * @see https://datatracker.ietf.org/doc/html/rfc7009
   * @param overwriteAccessToken - Overwrite the Access Token, that should be revoked.
   * @returns An Observable that completes when the access token has been revoked
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  public revokeAccessToken (overwriteAccessToken?: string): Observable<void> {
    const accessToken: string | undefined = overwriteAccessToken ?? this._keycloakStoreService.accessToken;

    return accessToken === undefined
      ? throwError((): Error => new Error("Expected access token to be valid."))
      : this._revokeToken("access_token", accessToken).pipe(map((): void => void 0));
  }

  /**
   * Checks if the current refresh token is valid
   * @returns The state of the refresh token validity
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  public isRefreshTokenValid (): boolean {
    const refreshToken: string | undefined = this._keycloakStoreService.refreshToken;

    if (refreshToken === undefined) return false;

    try {
      const parsedRefreshToken: ParsedKeycloakToken = parseJWT<ParsedKeycloakToken>(refreshToken);

      return parsedRefreshToken.exp * 1000 >= Date.now();
    } catch {
      return false;
    }
  }

  /**
   * Checks if the current access token is valid
   * @returns The state of the access token validity
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  public isAccessTokenValid (): boolean {
    const accessToken: string | undefined = this._keycloakStoreService.accessToken;

    if (accessToken === undefined) return false;

    try {
      const parsedAccessToken: ParsedKeycloakToken = parseJWT<ParsedKeycloakToken>(accessToken);

      return parsedAccessToken.exp * 1000 >= Date.now();
    } catch {
      return false;
    }
  }

  /**
   * Creating sessions by email and password. Can also take additional HTTP Headers.
   * @param email - Email that the user uses
   * @param password - Password the users uses
   * @param httpHeaders - Additionals for the HTTP Request (Header- and/or Body-Additions)
   * @returns Tokens as Observable
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  public login (email: string, password: string, autoStartInterval?: boolean, httpHeaders?: HttpHeaders): Observable<KeycloakTokensResponse> {
    this._keycloakStoreService.email = email;

    let headers: HttpHeaders = new HttpHeaders({
      [ OwnHttpHeaders.CONTENT_TYPE ]: HttpContentTypes.Application.X_WWW_FORM_URLENCODED,
      [ SKIP_KEYCLOAK_INTERCEPTOR ]: "true"
    });

    if (httpHeaders)
      headers = mergeHttpHeaders(headers, httpHeaders);

    const body: URLSearchParams = new URLSearchParams();

    body.append(AuthBody.USERNAME, email);
    body.append(AuthBody.PASSWORD, password);
    body.append(AuthBody.GRANT_TYPE, AuthBody.GrantTypes.GRANT_PASSWORD);
    body.append(GenericBody.CLIENT_ID, this._keycloakConfig.resource);

    return this._httpClient.post<KeycloakTokensResponse>(this._endpointToken, body, {
      headers,
      observe: "body",
      responseType: "json"
    }).pipe(
      timeout(this._timeout),
      tap((response: KeycloakTokensResponse): void => {
        this._keycloakStoreService.tokens = response;
        this._keycloakStoreService.email = email;
        // Will skip KeycloakService.startAccessTokenUpdate if called
        this._isAuthorized.next(true);

        if (shouldUpdateByInterval(this._keycloakConfig) && autoStartInterval)
          this._updateAccessTokenByInterval(httpHeaders);
      }),
      catchError(() => {
        this._isAuthorized.next(false);

        return throwError(() => new Error("Could not login"));
      })
    );
  }

  /**
   * Revoke sessions by logged in user
   * @param httpHeaders - Additionals for the HTTP Request (Header- and/or Body-Additions)
   * @returns An observable that completes when the logout is done
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  public logout (httpHeaders?: HttpHeaders): Observable<void> {
    let headers: HttpHeaders = new HttpHeaders({
      [ OwnHttpHeaders.CONTENT_TYPE ]: HttpContentTypes.Application.X_WWW_FORM_URLENCODED
    });

    if (httpHeaders)
      headers = mergeHttpHeaders(headers, httpHeaders);

    const body: URLSearchParams = new URLSearchParams();

    /* eslint-disable-next-line @tseslint/no-non-null-assertion */
    body.append(AuthBody.REFRESH_TOKEN, this._keycloakStoreService.refreshToken!);
    body.append(GenericBody.CLIENT_ID, this._keycloakConfig.resource);

    return this._httpClient.post<never>(this._endpointLogout, body, {
      headers,
      observe: "body",
      responseType: "json"
    }).pipe(
      timeout(this._timeout),
      tap((): void => {
        this.stopAccessTokenUpdate();
        this._keycloakStoreService.clear();
        this._isAuthorized.next(false);
      })
    );
  }

  /**
   * Initializing the Access Token refresh procedure after the remaining TTL of the existing Access Token is reached
   * @param httpHeaders - Additionals for the HTTP Request (Header- and/or Body-Additions)
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  public startAccessTokenUpdate (httpHeaders?: HttpHeaders): void {
    if (!this.isRefreshTokenValid())
      return void this._isAuthorized.next(false);

    this._isAuthorized.next(true);
    this._updateAccessTokenAfterRemainingTTLByInterval(httpHeaders);
  }

  /**
   * Removing the Access Token refresh procedure
   * @remarks Gets called after successfull KeycloakService.logout().
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  public stopAccessTokenUpdate (): void {
    this._accessTokenUpdateTimerSubscription?.unsubscribe();
    this._accessTokenUpdateIntervalSubscription?.unsubscribe();
  }

  /**
   * Force the Access Token update. Can also take additional HTTP Headers.
   * @param httpHeaders - Additionals for the HTTP Request (Header- and/or Body-Additions)
   * @returns Keycloak Tokens as Observable
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  public forceUpdateAccessToken (httpHeaders?: HttpHeaders): Observable<KeycloakTokensResponse> {
    return this.isRefreshTokenValid()
      ? this._updateAccessToken(httpHeaders)
      : throwError((): Error => new Error("Expected refresh token to be valid."));
  }

  /**
   * Validate user Credentials by creating a new Session and mark the newly created Session as invalid.
   * @param email - The email as partial credential
   * @param password - The password as partial credential
   * @param httpOptions - Additionals for the HTTP Request (Header- and/or Body-Additions)
   * @returns An observable that completes when the credentials have been validated
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  public validateCredentials (email: string, password: string, httpOptions?: HttpOptions<never>): Observable<void> {
    let headers: HttpHeaders = new HttpHeaders({
      [ OwnHttpHeaders.CONTENT_TYPE ]: HttpContentTypes.Application.X_WWW_FORM_URLENCODED,
      [ SKIP_KEYCLOAK_INTERCEPTOR ]: "true"
    });

    if (httpOptions?.headers)
      headers = mergeHttpHeaders(headers, httpOptions.headers);

    const body: URLSearchParams = new URLSearchParams();

    body.append(AuthBody.USERNAME, email);
    body.append(AuthBody.PASSWORD, password);
    body.append(AuthBody.GRANT_TYPE, AuthBody.GrantTypes.GRANT_PASSWORD);
    body.append(GenericBody.CLIENT_ID, this._keycloakConfig.resource);

    return this._httpClient.post<KeycloakTokensResponse>(this._endpointToken, body, {
      headers,
      observe: "body",
      responseType: "json"
    }).pipe(
      timeout(this._timeout),
      mergeMap((response: KeycloakTokensResponse): ObservableInput<HttpResponse<unknown>> => this._revokeToken("access_token", response.access_token)),
      map((): void => void 0)
    );
  }

  /**
   * Check if an explicit allowed origin is in the Access Token
   * @param allowedOrigin - The allowedOrigin to check
   * @returns `true`, if the allowedOrigin exists, otherwise `false`
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  public hasAccessTokenAllowedOrigin (allowedOrigin: string): boolean {
    const parsedAccessToken: ParsedKeycloakToken | null = this._keycloakStoreService.parsedAccessToken;

    if (!parsedAccessToken?.[ "allowed-origins" ]) return false;

    return parsedAccessToken[ "allowed-origins" ].includes(allowedOrigin);
  }

  /**
   * Check if an `aud` is in the Access Token
   * @param aud - aud to check
   * @returns `true`, if the `aud` exists, otherwise `false`
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  public hasAccessTokenAud (aud: string): boolean {
    const parsedAccessToken: ParsedKeycloakToken | null = this._keycloakStoreService.parsedAccessToken;

    if (parsedAccessToken === null) return false;

    return parsedAccessToken.aud.includes(aud);
  }

  /**
   * Check if an explicit realmAccess is in the Access Token
   * @param realmAccess - The realmAccess to check
   * @returns `true`, if the realmAccess exists, otherwise `false`
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  public hasAccessTokenRealmAccess (realmAccess: string): boolean {
    const parsedAccessToken: ParsedKeycloakToken | null = this._keycloakStoreService.parsedAccessToken;

    if (parsedAccessToken === null) return false;

    return parsedAccessToken.realm_access.roles.includes(realmAccess);
  }

  /**
   * Check if an `resourceAccess` is in the Access Token
   * @param key - The key to resolve the resourceAccess
   * @param resourceAccess - The resourceAccess to check
   * @returns `true`, if the resourceAccess exists, otherwise `false`
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  public hasAccessTokenResourceAccess (key: string, resourceAccess: string): boolean {
    const parsedAccessToken: ParsedKeycloakToken | null = this._keycloakStoreService.parsedAccessToken;

    if (!parsedAccessToken?.resource_access[ key ]) return false;

    return parsedAccessToken.resource_access[ key ].roles.includes(resourceAccess);
  }
}
