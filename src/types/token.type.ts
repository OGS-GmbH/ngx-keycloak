/**
 * Type definition for a parsed Keycloak token.
 *
 * @since 1.0.0
 * @author Simon Kovtyk
 */
export type ParsedKeycloakToken = {
  /**
   * Expiration timestamp of token in seconds
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  exp: number;
  /**
   * Issued at timestamp of token in seconds
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  iat: number;
  /**
   * Token ID
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  jti: string;
  /**
   * Token ID
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  jss: string;
  /**
   * Subject ID
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  sub: string;
  /**
   * Token type
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  typ: string;
  /**
   * Client ID
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  azp: string;
  /**
   * Server-side session ID
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  session_state: string;
  /**
   * Not valid before timestamp of token in seconds
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  nbf: number;
  /**
   * Issuer ID
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  iss: string;
  /**
   * Timestamp of most reent authentication in seconds
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  auth_time: number;
  /**
   * Authentication Context Class Reference
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  acr: string;
  /**
   * Allowed origins for CORS
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  "allowed-origins"?: string[] | null;
  /**
   * Delegated authorization scopes
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  scope: string;
  /**
   * Indicator if email is verified
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  email_verified: boolean;
  /**
   * User's full name
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  name: string;
  /**
   * Session ID
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  sid: string;
  /**
   * Preferred username of authenicated user
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  preferred_username: string;
  /**
   * User’s first name
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  given_name: string;
  /**
   * User’s surname
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  family_name: string;
  /**
   * User’s email address
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  email: string;
  /**
   * Audiences of token
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  aud: string[];
  /**
   * Role assignments granted at the realm
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  realm_access: {
    /**
     * Roles assigned at the realm level
     *
     * @since 1.0.0
     * @author Simon Kovtyk
     */
    roles: string[];
  };
  /**
   * Role assignments granted per client/application
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  resource_access: Record<string, {
    /**
     * Roles assigned at the realm level
     *
     * @since 1.0.0
     * @author Simon Kovtyk
     */
    roles: string[];
  }>;
};
/**
 * Type definition for Keycloak token types.
 *
 * @since 1.0.0
 * @author Simon Kovtyk
 */
export type KeycloakTokens = "refresh" | "access";
