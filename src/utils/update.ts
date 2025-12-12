import { UpdateStrategy } from "../enums/update-strategy.enum";
import { SpecificKeycloakConfig } from "../types/config.type";

/**
 * Determines if interval updates should be made based on the specified update strategy
 * @internal
 *
 * @since 1.0.0
 * @author Simon Kovtyk
 */
export const shouldUpdateByInterval = (specificKeycloakConfig: SpecificKeycloakConfig): boolean =>
  specificKeycloakConfig.updateStrategy === UpdateStrategy.BOTH || specificKeycloakConfig.updateStrategy === UpdateStrategy.INTERVAL;
/**
 * Determines if interceptor updates should be made based on the specified update strategy
 * @internal
 *
 * @since 1.0.0
 * @author Simon Kovtyk
 */
export const shouldUpdateByInterceptor = (specificKeycloakConfig: SpecificKeycloakConfig): boolean =>
  specificKeycloakConfig.updateStrategy === UpdateStrategy.BOTH || specificKeycloakConfig.updateStrategy === UpdateStrategy.INTERCEPTOR;
