/**
 * Raw response from Keycloak token endpoint
 *
 * @since 1.0.0
 * @author Simon Kovtyk
 */
export type KeycloakTokensResponse = {
  /**
   * Access Token
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  access_token: string;
  /**
   * Access Token expires in (seconds)
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  expires_in: number;
  /**
   * Policy for not before time
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  "not-before-policy": number;
  /**
   * Refresh Token expires in (seconds)
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  refresh_expires_in: number;
  /**
   * Refresh Token
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  refresh_token: string;
  /**
   * Scope for which the tokens are valid
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  scope: string;
  /**
   * Session state identifier
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  session_state: string;
  /**
   * Token type (e.g., "bearer")
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  token_type: string;
};
