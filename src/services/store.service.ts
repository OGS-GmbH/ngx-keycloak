import { inject, Injectable } from "@angular/core";
import { KEYCLOAK_CONFIG_TOKEN } from "../tokens/config.token";
import { KeycloakTokens } from "../types/api-response.type";
import { SpecificKeycloakConfig } from "../types/config.type";
import { MultiKeycloakStorage } from "../types/storage.type";
import { ParsedKeycloakToken } from "../types/token.type";
import { parseJWT } from "../utils/parse-jwt";

/**
 * Service for handling Storage Access to Keycloak Tokens
 */
@Injectable({
  providedIn: "root"
})
export class KeycloakStoreService {
  private readonly _config: SpecificKeycloakConfig = inject(KEYCLOAK_CONFIG_TOKEN);

  /**
   * Clears all data in the storage
   */
  public clear (): void {
    this._config.storageType.removeItem(this._config.storageKey);
  }

  /**
   * Clears the tokens out of the storage
   */
  public clearTokens (): void {
    if (!this._config.useEmailAsCurrentUser) return void this._config.storageType.removeItem(this._config.storageKey);

    const currentEmail: string | null = this.email;

    if (currentEmail === null) return void this._config.storageType.removeItem(this._config.storageKey);

    this._config.storageType.setItem(this._config.storageKey, JSON.stringify({ email: currentEmail } as MultiKeycloakStorage));
  }

  /**
   * Clears the email out of storage
   */
  public clearEmail (): void {
    if (!this._config.useEmailAsCurrentUser) return;

    const currentTokens: KeycloakTokens | null = this.tokens;

    if (currentTokens === null) this._config.storageType.removeItem(this._config.storageKey);

    this._config.storageType.setItem(this._config.storageKey, JSON.stringify({ tokens: currentTokens } as MultiKeycloakStorage));
  }

  /**
   * Setter for setting email in Storage
   * @param {string | null} email - The email, that should be saved
   */
  public set email (email: string | null) {
    if (!this._config.useEmailAsCurrentUser) return;

    const storageValue: string | null = this._config.storageType.getItem(this._config.storageKey);
    const parsedValue: MultiKeycloakStorage | null = storageValue === null ? null : JSON.parse(storageValue) as MultiKeycloakStorage;

    if (email === null && parsedValue?.tokens === undefined) {
      this._config.storageType.removeItem(this._config.storageKey);

      return;
    }

    const multiKeycloakStorage: MultiKeycloakStorage = {};

    if (parsedValue?.tokens !== undefined) multiKeycloakStorage.tokens = parsedValue.tokens;

    if (email !== null) multiKeycloakStorage.email = email;

    this._config.storageType.setItem(this._config.storageKey, JSON.stringify(multiKeycloakStorage));
  }

  /**
   * Getter for getting email key from Storage
   * @return {string | null} - The existing email
   */
  public get email (): string | null {
    if (!this._config.useEmailAsCurrentUser) return null;

    const storageValue: string | null = this._config.storageType.getItem(this._config.storageKey);

    return storageValue === null ? null : (JSON.parse(storageValue) as MultiKeycloakStorage).email ?? null;
  }

  /**
   * Setter for setting Keycloak Tokens
   * @param {KeycloakTokens | null} tokens - Keycloak Tokens, that should be saved
   */
  public set tokens (tokens: KeycloakTokens | null) {
    if (this._config.useEmailAsCurrentUser) {
      const storageValue: string | null = this._config.storageType.getItem(this._config.storageKey);
      const parsedValue: MultiKeycloakStorage | null = storageValue === null ? null : JSON.parse(storageValue) as MultiKeycloakStorage;

      if (parsedValue?.email === undefined && tokens === null) {
        this._config.storageType.removeItem(this._config.storageKey);

        return;
      }

      const multiKeycloakStorage: MultiKeycloakStorage = {};

      if (parsedValue?.email !== undefined) multiKeycloakStorage.email = parsedValue.email;

      if (tokens !== null) multiKeycloakStorage.tokens = tokens;

      this._config.storageType.setItem(this._config.storageKey, JSON.stringify(multiKeycloakStorage));

      return;
    }

    if (tokens === null) {
      this._config.storageType.removeItem(this._config.storageKey);

      return;
    }

    this._config.storageType.setItem(this._config.storageKey, JSON.stringify(tokens));
  }

  /**
   * Getter for getting the Keycloak Tokens from Storage
   * @return {KeycloakTokens | null} - The Keycloak Tokens from Storage
   */
  public get tokens (): KeycloakTokens | null {
    const storageValue: string | null = this._config.storageType.getItem(this._config.storageKey);

    if (storageValue === null) return null;

    return this._config.useEmailAsCurrentUser ? (JSON.parse(storageValue) as MultiKeycloakStorage).tokens ?? null : JSON.parse(storageValue) as KeycloakTokens | null;
  }

  /**
   * Getter for getting the Keycloak Access Token
   * @return {string | undefined} - Keycloak Access Token
   */
  public get accessToken (): string | undefined {
    return this.tokens?.access_token;
  }

  /**
   * Getter for getting the Keycloak Refresh Token
   * @return {string | undefined}
   */
  public get refreshToken (): string | undefined {
    return this.tokens?.refresh_token;
  }

  /**
   * Getter for getting the Time-To-Live of Keycloak Access Token
   * @return {number} - Seconds of the TTL of Keycloak Access Token
   */
  public get TTLOfAccessToken (): number {
    const parsedAccessToken: ParsedKeycloakToken | null = this.parsedAccessToken;

    if (parsedAccessToken === null)
      return 300;


    const { exp, iat }: { exp: number; iat: number; } = parsedAccessToken;

    return (exp - iat) * 1000;
  }

  /**
   * Getter for getting the remaining Time-To-Live of Keycloak Access Token by existance
   * @return {number} - Seconds of the TTL of Keycloak Access Token
   */
  public get remainingTTLOfAccessToken (): number {
    const expiry: number | undefined = this.parsedAccessToken?.exp;

    return expiry === undefined ? 300 : expiry * 1000 - Date.now();
  }

  /**
   * Getter for getting the remaining Time-To-Live of Keycloak Access Token by existance
   * @return {number} - Seconds of the TTL of Keycloak Access Token
   */
  public get remainingTTLOfRefreshToken (): number {
    const expiry: number | undefined = this.parsedRefreshToken?.exp;

    if (expiry === undefined)
      return 1800;


    return expiry * 1000 - Date.now();
  }

  /**
   * Get decoded Access Token
   * @return {ParsedKeycloakToken | null} - The decoded Access Token
   */
  public get parsedAccessToken (): ParsedKeycloakToken | null {
    const accessToken: string | undefined = this.accessToken;

    if (accessToken === undefined)
      return null;


    try {
      return parseJWT<ParsedKeycloakToken>(accessToken);
    } catch {
      return null;
    }
  }

  /**
   * Get decoded Refresh Token
   * @return {ParsedKeycloakToken | null} - The decoded Refresh Token
   */
  public get parsedRefreshToken (): ParsedKeycloakToken | null {
    const refreshToken: string | undefined = this.refreshToken;

    if (refreshToken === undefined)
      return null;


    try {
      return parseJWT<ParsedKeycloakToken>(refreshToken);
    } catch {
      return null;
    }
  }
}
