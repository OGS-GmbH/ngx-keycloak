import { KeycloakTokens } from "./token.type";

/**
 * Options for KeycloakGuard
 *
 * @since 1.0.0
 * @author Simon Kovtyk
 */
interface KeycloakGuardOptions {
  /**
   * Token, to check against
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  token?: KeycloakTokens;
  /**
   * Route, to fallback to
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  route?: string;
  /**
   * Reverse the guard logic
   * @remarks If set to `true`, the guard will allow access if the user is NOT authenticated
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  reverse?: boolean;
}

export type {
  KeycloakGuardOptions
};
