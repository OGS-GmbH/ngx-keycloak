# Configuration
To configure this package, we need to provide a configuration of type ``KeycloakConfig``. This configuration represents the customizations of the Keycloak-Workflow on our client-side.

Supported properties of ``KeycloakConfig``:
```` typescript
resource: string,
authServerUrl: string,
realm: string,
guardFallbackUrl: string,
storageType: Storage,
storageKey: string,
useEmailAsCurrentUser?: boolean | undefined,
timeout?: number | undefined,
expirationOffset?: number | undefined
````



### ``resource``
The resource our client is accessing. This option will be appended into the requests' body as form data with the key "client_id".

### ``authServerUrl``
The URL or Path to our auth server. Every endpoint from Keycloak will be appended to this.

### ``realm``
The realm from Keycloak specification.

### ``guardFallbackUrl``
Fallback-URL the user gets redirected to, when securing router with ``keycloakGuard`` and missing authentication.

### ``storageType``
This property allows to specify, which storage should be used to store value.

### ``storageKey``
This property enables the customization of the key, where the storage (if enabled) should store the values.

### ``useEmailAsCurrentUser``
**This property is only for internal use.**\
With this property set to ``true``, the email given by ``KeycloakService.login()`` will be used as currentUser HTTP requests header field as long as the ``KeycloakInterceptor`` is used.\
Default: ``false``

### ``timeout``
This property is for controlling the HTTP request timeout (in milliseconds).\
Default: ``3000``

### ``expirationOffset``
This property allows to add offset (in milliseconds) to the expiration of the Access Token.\
Default: ``3000``

After creating a ``KeycloakConfig``, we can provide it by an injection-token:

```` typescript
...
@NgModule({
	...
		providers: [
        ...
		{
			provide: KEYCLOAK_CONFIG_TOKEN,
			useValue: KEYCLOAK_CONFIG
		},

		{
      		provide: KEYCLOAK_HTTP_CONFIG_TOKEN,
     		 useValue: KEYCLOAK_HTTP_CONFIG
    	}
	    ...
    ]
    ...
})
...
````


Or inject it in ``keycloakModule`` using ``forRoot``


```` typescript
...
@NgModule({
	...
		imports: [
        ...
	    KeycloakModule.forRoot(ENVIRONMENT_CONFIG.keycloakConfig),
	    ...
    ]
    ...
})
...
````


Both methods register the Keycloak services in Angular's dependency injection system, making them available throughout your application.


To use these functionalities, we just need to import it in a file:



## Usage

To use the Keycloak functionalities, import the service:
```typescript
import { KeycloakService } from "@ogs-gmbh/ngx-keycloak";
```

And inject it in your component or service:
```typescript
private readonly _keycloakService: KeycloakService = inject(KeycloakService);
```

The `inject()` function retrieves the `KeycloakService` instance that was configured by the module, allowing you to use methods like `login()`, `logout()`, `isAuthenticated()`, etc.


