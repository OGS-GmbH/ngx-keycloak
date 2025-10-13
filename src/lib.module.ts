import { CommonModule } from "@angular/common";
import { ModuleWithProviders, NgModule } from "@angular/core";
import { provideKeycloakConfig } from "./providers/config.provider";
import { provideKeycloakHttpConfig } from "./providers/http.provider";
import { provideKeycloakTokenInvalidInterceptor, provideKeylcoakInterceptor } from "./providers/interceptor.provider";
import { KeycloakService } from "./services/auth.service";
import { KeycloakStoreService } from "./services/store.service";
import { KeycloakConfig } from "./types/config.type";

/* eslint-disable @tseslint/no-extraneous-class */
@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    KeycloakService,
    KeycloakStoreService,
    provideKeylcoakInterceptor(),
    provideKeycloakTokenInvalidInterceptor()
  ]
})
export class KeycloakModule {
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

