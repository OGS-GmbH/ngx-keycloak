# Configuration

## Creating a config

You can create a config by using type [`KeycloakConfig`](/reference/types/KeycloakConfig).

To configure the http property, adhere to [ngx-http docs](https://ogs-gmbh.github.io/ngx-http/reference/types/HttpConfig).

Take the following code as an example:

```typescript [keycloak.config.ts]
import { KeycloakConfig } from "@ogs-gmbh/ngx-keycloak";

const config: KeycloakConfig = {
  http: {
    // HTTP config
  },
  keycloak: {
    // Keycloak config
  }
}
```

## Providing a config

To configure this package, we need to provide a configuration of type [`KeycloakConfig`](/reference/types/KeycloakConfig) trough [Dependency Injection](https://v18.angular.dev/guide/di).

We offer 2 ways of doing so. Either by using [`KeycloakModule.forRoot`](/reference/classes/KeycloakModule#forroot) (recommended) or by providing both [`KEYCLOAK_CONFIG_TOKEN`](/reference/variables/KEYCLOAK_CONFIG_TOKEN) and [`KEYCLOAK_HTTP_CONFIG`](/reference/variables/KEYCLOAK_HTTP_CONFIG).

::: tip Recommendation

We recommend to use `KeycloakModule.forRoot` since it provides a better recongnizable API.

:::

```typescript [example.module.ts]
import { KeycloakModule } from "@ogs-gmbh/ngx-keycloak";

@NgModule({
  imports: [
    KeycloakModule.forRoot(ENVIRONMENT_CONFIG.keycloakConfig)
  ]
})
export class AppModule {}
```

If you need more control over the API, you can provide both tokens:

```typescript [example.module.ts]
import { KeycloakModule, KEYCLOAK_CONFIG_TOKEN, KEYCLOAK_HTTP_CONFIG_TOKEN } from "@ogs-gmbh/ngx-keycloak";

@NgModule,
  imports: [
    KeycloakModule
  ],
  providers: [
    {
	  provide: KEYCLOAK_CONFIG_TOKEN,
	  useValue: KEYCLOAK_CONFIG
	},
    {
      provide: KEYCLOAK_HTTP_CONFIG_TOKEN,
      useValue: KEYCLOAK_HTTP_CONFIG
    }
  ]
})
export class AppModule {}
```

Both methods register the Keycloak services in Angular's dependency injection system, making them available throughout your application.

## Usage

To use the Keycloak functionalities, use the following example:

```typescript [example.component.ts]
import { KeycloakService } from "@ogs-gmbh/ngx-keycloak";

@Component({
  selector: "app-component",
  template: ``
})
export class AppComponent {
  private readonly _keycloakService: KeycloakService = inject(KeycloakService);
}
```

The [`inject()`](https://angular.dev/api/core/inject) function retrieves the [`KeycloakService`](/reference/classes/KeycloakService) instance that was configured by the module, allowing you to use methods like [`login()`](/reference/classes/KeycloakService#login), [`logout()`](/reference/classes/KeycloakService#logout), [`isAuthenticated()`](/reference/classes/KeycloakService#isauthorized), etc.
