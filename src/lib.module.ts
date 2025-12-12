import { CommonModule } from "@angular/common";
import { ModuleWithProviders, NgModule } from "@angular/core";
import { provideKeycloakConfig } from "./providers/config.provider";
import { provideKeycloakHttpConfig } from "./providers/http.provider";
import { provideKeycloakTokenInvalidInterceptor, provideKeycloakInterceptor } from "./providers/interceptor.provider";
import { KeycloakService } from "./services/auth.service";
import { KeycloakStoreService } from "./services/store.service";
import { KeycloakConfig } from "./types/config.type";

/**
 * Keycloak Module for Angular Applications
 * @category Module
 */
/* eslint-disable @tseslint/no-extraneous-class */
@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    KeycloakService,
    KeycloakStoreService,
    provideKeycloakInterceptor(),
    provideKeycloakTokenInvalidInterceptor()
  ]
})
export class KeycloakModule {
  /**
   * Configures the Keycloak Module with the provided Keycloak configuration
   * @param keycloakConfig - The Keycloak configuration object
   * @returns A module with providers for the Keycloak Module
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  public static forRoot (keycloakConfig: KeycloakConfig): ModuleWithProviders<KeycloakModule> {
    return {
      ngModule: KeycloakModule,
      providers: [
        provideKeycloakConfig(keycloakConfig.keycloak),
        provideKeycloakHttpConfig(keycloakConfig.http)
      ]
    };
  }
}
/* eslint-enable @tseslint/no-extraneous-class */

