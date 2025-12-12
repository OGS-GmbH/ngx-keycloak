import { HttpConfig } from "@ogs-gmbh/ngx-http";
import { UpdateStrategy } from "../enums/update-strategy.enum";

/**
 * Signature for guard fallback functions
 * @category Types
 */
export type GuardFallbackFn = () => unknown;
/**
 * Keycloak-related configuration
 * @category Types
 */
export type SpecificKeycloakConfig = {
  /**
   * The resource our client is accessing. This option will be appended into the requests' body as form data with the key "client_id"
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  resource: string;
  /**
   * The realm from Keycloak specification.
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  realm: string;
  /**
   * Fallback-URL the user gets redirected to, when securing router with ``keycloakGuard`` and missing authentication.
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  guardFallbackUrl?: string | undefined;
  /**
   * Fallback-URL the user gets redirected to, when securing router with ``keycloakGuard`` and existing authentication.
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  reverseGuardFallbackUrl?: string | undefined;
  /**
   * Guard-URL the user gets redirected to, when securing router with ``keycloakGuard`` and missing authentication.
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  guardFallbackCallback?: GuardFallbackFn | undefined;
  /**
   * Guard-URL the user gets redirected to, when securing router with ``keycloakGuard`` and existing authentication.
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  reverseGuardFallbackCallback?: GuardFallbackFn | undefined;
  /**
   * This property allows to specify, which storage should be used to store value.
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  storageType: Storage;
  /**
   * This property enables the customization of the key, where the storage (if enabled) should store the values.
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  storageKey: string;
  /**
   * With this property set to ``true``, the email given by ``KeycloakService.login()`` will be used as currentUser HTTP requests header field as long as the ``KeycloakInterceptor`` is used.
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  useEmailAsCurrentUser?: boolean | undefined;
  /**
   * This property is for controlling the HTTP request timeout (in milliseconds).\
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  timeout?: number | undefined;
  /**
   * This property allows to add offset (in milliseconds) to the expiration of the Access Token.\
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  expirationOffset?: number | undefined;
  /**
   * Update strategy for handling token updates
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  updateStrategy: UpdateStrategy;
};
/**
 * Type is used for defining Keycloak-specific data
 * @category Types
 */
export type KeycloakConfig = {
  /**
   * HTTP configuration for Keycloak requests
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  http: HttpConfig;
  /**
   * Keycloak-specific configuration options
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  keycloak: SpecificKeycloakConfig;
};
