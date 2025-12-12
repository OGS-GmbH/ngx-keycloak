import { KeycloakTokensResponse } from "./api-response.type";

/**
 * Keycloak Storage Types
 *
 * @since 1.0.0
 * @author Simon Kovtyk
 */
export type MultiKeycloakStorage = {
  /**
   * Email of the current user
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  email?: string | undefined;
  /**
   * Keycloak Tokens
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  tokens?: KeycloakTokensResponse | undefined;
};
/**
 * Simple Keycloak Storage Type
 *
 * @since 1.0.0
 * @author Simon Kovtyk
 */
export type SimpleKeycloakStorage = KeycloakTokensResponse;
