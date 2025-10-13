import { inject } from "@angular/core";
import { CanActivateFn, GuardResult, MaybeAsync, Router } from "@angular/router";
import { KeycloakService } from "../services/auth.service";
import { KEYCLOAK_CONFIG_TOKEN } from "../tokens/config.token";
import { SpecificKeycloakConfig } from "../types/config.type";
import { KeycloakGuardOptions } from "../types/guard.type";

/**
 * Typical guard for securing client side routes
 * @return {CanActivateFn} - Returns the actual fn.
 */
export const keycloakGuard: (options?: KeycloakGuardOptions) => CanActivateFn = (options?: KeycloakGuardOptions): CanActivateFn => (): MaybeAsync<GuardResult> => {
  const keycloakService: KeycloakService = inject(KeycloakService);
  const isTokenValid: boolean = options?.token === "access"
    ? keycloakService.isAccessTokenValid()
    : keycloakService.isRefreshTokenValid();

  if (isTokenValid !== (options?.reverse ?? false))
    return true;

  const keycloakConfig: SpecificKeycloakConfig = inject(KEYCLOAK_CONFIG_TOKEN);
  const router: Router = inject(Router);

  options?.reverse
    ? keycloakConfig.guardFallbackCallback?.()
    : keycloakConfig.reverseGuardFallbackCallback?.();

  const fallbackUrl: string | undefined = options?.reverse
    ? keycloakConfig.reverseGuardFallbackUrl
    : keycloakConfig.guardFallbackUrl;

  if (fallbackUrl !== undefined)
    void router.navigateByUrl(fallbackUrl);

  return false;
};

