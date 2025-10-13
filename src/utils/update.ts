import { UpdateStrategy } from "../enums/update-strategy.enum";
import { SpecificKeycloakConfig } from "../types/config.type";

export const shouldUpdateByInterval = (specificKeycloakConfig: SpecificKeycloakConfig): boolean =>
  specificKeycloakConfig.updateStrategy === UpdateStrategy.BOTH || specificKeycloakConfig.updateStrategy === UpdateStrategy.INTERVAL;
export const shouldUpdateByInterceptor = (specificKeycloakConfig: SpecificKeycloakConfig): boolean =>
  specificKeycloakConfig.updateStrategy === UpdateStrategy.BOTH || specificKeycloakConfig.updateStrategy === UpdateStrategy.INTERCEPTOR;
