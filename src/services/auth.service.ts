import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { inject, Injectable, NgZone } from "@angular/core";
import { mergeHttpHeaders, HttpContentTypes, HttpHeaders as OwnHttpHeaders, HttpOptions } from "@ogs-gmbh/ngx-http";
import { BehaviorSubject, catchError, interval, map, mergeMap, Observable, ObservableInput, Subscription, tap, throwError, timeout, timer } from "rxjs";
import { AuthBody, GenericBody, RevokeBody } from "../constants/http-body";
import { SKIP_KEYCLOAK_INTERCEPTOR } from "../interceptors/auth.interceptor";
import { KEYCLOAK_CONFIG_TOKEN } from "../tokens/config.token";
import { KEYCLOAK_HTTP_CONFIG } from "../tokens/http.token";
import { KeycloakTokens } from "../types/api-response.type";
import { SpecificKeycloakConfig } from "../types/config.type";
import { ParsedKeycloakToken } from "../types/token.type";
import { parseJWT } from "../utils/parse-jwt";
import { shouldUpdateByInterval } from "../utils/update";
import { KeycloakStoreService } from "./store.service";

/**
 * Service for handling Keycloak sessions
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

  private _isRefreshTokenValidThen (compareWith: number): boolean {
    const remainingTTLOfRefreshToken: number = this._keycloakStoreService.remainingTTLOfRefreshToken;

    return remainingTTLOfRefreshToken > compareWith;
  }

  /**
   * Checks if a user is authorized by checking the state of the called workflow
   * @return {boolean} - The status of the potential authorization
   */
  public isAuthorized (): boolean {
    return this._isAuthorized.value;
  }

  /**
   * Checks if a user is authorized by checking the state of the called workflow
   * @returns {Observable<boolean>} - An observable with the status of the potential authorization
   */
  public isAuthorized$ (): Observable<boolean> {
    return this._isAuthorized$;
  }

  /**
   * Setter for setting the authorization of
   * @param {boolean} isAuthorized
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

  private _updateAccessToken (httpHeaders?: HttpHeaders): Observable<KeycloakTokens> {
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

    return this._httpClient.post<KeycloakTokens>(this._endpointToken, body, {
      headers,
      observe: "body",
      responseType: "json"
    }).pipe(
      timeout(this._timeout),
      tap((responseBody: KeycloakTokens): void => {
        this._keycloakStoreService.tokens = responseBody;
      }),
      catchError((): Observable<KeycloakTokens> => {
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
   * Revoke Refresh Token and current Session, since it is a Keycloak-Behavior.
   * @see https://datatracker.ietf.org/doc/html/rfc7009
   * @param {string | undefined} overwriteRefreshToken - Overwrite the Refresh Token, that should be revoked.
   * @return {Observable<void>}
   */
  public revokeRefreshToken (overwriteRefreshToken?: string): Observable<void> {
    const refreshToken: string | undefined = overwriteRefreshToken ?? this._keycloakStoreService.refreshToken;

    return refreshToken === undefined
      ? throwError((): Error => new Error("Expected refresh token to be valid."))
      : this._revokeToken("refresh_token", refreshToken).pipe(map((): void => void 0));
  }

  /**
   * Revoke Access Token and current Session, since it is a Keycloak-Behavior.
   * @see https://datatracker.ietf.org/doc/html/rfc7009
   * @param {string | undefined} overwriteAccessToken - Overwrite the Access Token, that should be revoked.
   * @return {Observable<void>}
   */
  public revokeAccessToken (overwriteAccessToken?: string): Observable<void> {
    const accessToken: string | undefined = overwriteAccessToken ?? this._keycloakStoreService.accessToken;

    return accessToken === undefined
      ? throwError((): Error => new Error("Expected access token to be valid."))
      : this._revokeToken("access_token", accessToken).pipe(map((): void => void 0));
  }

  /**
   * Checks if the current refresh token is valid
   * @returns {boolean} - The state of the validity
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
   * @returns {boolean} - The state of the validity
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
   * @param {string} email - Email that the user uses
   * @param {string} password - Password the users uses
   * @param {AdditionalsInRequest[] | undefined} additionalsInRequest - Additionals for the HTTP Request (Header-
   *   and/or Body-Additions)
   * @return {Observable<KeycloakTokens>} - Tokens as Observable
   */
  public login (email: string, password: string, autoStartInterval?: boolean, httpHeaders?: HttpHeaders): Observable<KeycloakTokens> {
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

    return this._httpClient.post<KeycloakTokens>(this._endpointToken, body, {
      headers,
      observe: "body",
      responseType: "json"
    }).pipe(
      timeout(this._timeout),
      tap((response: KeycloakTokens): void => {
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
   * Revoke sessions by logged in user. Can also take additional HTTP Headers.
   * @param {AdditionalsInRequest | undefined} additionalsInRequest - Additionals for the HTTP Request (Header- and/or
   *   Body-Additions)
   * @return {Observable<void>} - void as Observable
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
   * @param {AdditionalsInRequest | undefined} additionalsInRequest - Additionals for the HTTP Request (Header- and/or
   *   Body-Additions)
   */
  public startAccessTokenUpdate (httpHeaders?: HttpHeaders): void {
    if (!this.isRefreshTokenValid())
      return void this._isAuthorized.next(false);

    this._isAuthorized.next(true);
    this._updateAccessTokenAfterRemainingTTLByInterval(httpHeaders);
  }

  /**
   * Removing the Access Token refresh procedure.\
   * INFO: Does get called after successfull KeycloakService.logout().
   */
  public stopAccessTokenUpdate (): void {
    this._accessTokenUpdateTimerSubscription?.unsubscribe();
    this._accessTokenUpdateIntervalSubscription?.unsubscribe();
  }

  /**
   * Force to update the Access Token. Can also take additional HTTP Headers.
   * @param {AdditionalsInRequest | undefined} additionalsInRequest - Additionals for the HTTP Request (Header- and/or Body-Additions)
   * @return {Observable<KeycloakTokens>} - Tokens as Observable
   */
  public forceUpdateAccessToken (httpHeaders?: HttpHeaders): Observable<KeycloakTokens> {
    return this.isRefreshTokenValid()
      ? this._updateAccessToken(httpHeaders)
      : throwError((): Error => new Error("Expected refresh token to be valid."));
  }

  /**
   * Validate user Credentials by creating a new Session and mark the newly created Session as invalid.
   * @param {string} email - The email as partial credential
   * @param {string} password - The password as partial credential
   * @param {AdditionalsInRequest | undefined} additionalsInRequest - Additionals for the HTTP Request (Header- and/or
   *   Body-Additions)
   * @return {Observable<void>}
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

    return this._httpClient.post<KeycloakTokens>(this._endpointToken, body, {
      headers,
      observe: "body",
      responseType: "json"
    }).pipe(
      timeout(this._timeout),
      mergeMap((response: KeycloakTokens): ObservableInput<HttpResponse<unknown>> => this._revokeToken("access_token", response.access_token)),
      map((): void => void 0)
    );
  }

  /**
   * Check if an explicit allowed origin is in the Access Token
   * @param {string} allowedOrigin - The allowedOrigin to check
   * @returns {boolean} - true, if the allowedOrigin exists, otherweise false
   */
  public hasAccessTokenAllowedOrigin (allowedOrigin: string): boolean {
    const parsedAccessToken: ParsedKeycloakToken | null = this._keycloakStoreService.parsedAccessToken;

    if (!parsedAccessToken?.[ "allowed-origins" ]) return false;

    return parsedAccessToken[ "allowed-origins" ].includes(allowedOrigin);
  }

  /**
   * Check if an explicit aud is in the Access Token
   * @param {string} aud - The aud to check
   * @returns {boolean} - true, if the aud exists, otherwise false
   */
  public hasAccessTokenAud (aud: string): boolean {
    const parsedAccessToken: ParsedKeycloakToken | null = this._keycloakStoreService.parsedAccessToken;

    if (parsedAccessToken === null) return false;

    return parsedAccessToken.aud.includes(aud);
  }

  /**
   * Check if an explicit realmAccess is in the Access Token
   * @param {string} realmAccess - The realmAccess to check
   * @returns {boolean} - true, if the realmAccess exists, otherwise false
   */
  public hasAccessTokenRealmAccess (realmAccess: string): boolean {
    const parsedAccessToken: ParsedKeycloakToken | null = this._keycloakStoreService.parsedAccessToken;

    if (parsedAccessToken === null) return false;

    return parsedAccessToken.realm_access.roles.includes(realmAccess);
  }

  /**
   * Check if an explicit resourceAccess is in the Access Token
   * @param {string} key - The key to resolve the resourceAccess
   * @param {string} resourceAccess - The resourceAccess to check
   * @returns {boolean} - true, if the resourceAccess exists, otherwise false
   */
  public hasAccessTokenResourceAccess (key: string, resourceAccess: string): boolean {
    const parsedAccessToken: ParsedKeycloakToken | null = this._keycloakStoreService.parsedAccessToken;

    if (!parsedAccessToken?.resource_access[ key ]) return false;

    return parsedAccessToken.resource_access[ key ].roles.includes(resourceAccess);
  }
}
