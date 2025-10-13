import { ValueProvider } from "@angular/core";
import { buildHttpConnectionString, HttpConfig } from "@ogs-gmbh/ngx-http";
import { KEYCLOAK_HTTP_CONFIG } from "../tokens/http.token";

export const provideKeycloakHttpConfig = (httpConfig: HttpConfig): ValueProvider => ({
  provide: KEYCLOAK_HTTP_CONFIG,
  useValue: buildHttpConnectionString(httpConfig),
  multi: false
});
