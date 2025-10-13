# ngx-keycloak
Namespace for this project is @ogs.

# 1. Introduction
This package is for keycloak-specifig tasks.
With all functionalities together, it is an API for communicating with Keycloak.

# 2. Common tasks
## 2.1 Skipping the KeycloakInterceptor
For skipping the ``KeycloakInterceptor``, we simply need to add a flag to the HTTP-Headers of the request.

```` typescript
HttpClient.request(method, url, {
    headers: [
        [ SKIP_KEYCLOAK_INTERCEPTOR ]: "true"
    ]
})
````

The header value of the HTTP-Header-Field ``SKIP_KEYCLOAK_INTERCEPTOR`` can be any value as string.
The ``KeycloakInterceptor``'ll detect this flag and remove this field from the HTTP-Request without applying internal
fields to it.

# 3. Installation
For installing this package, the Nexus Registry, that delivers this package, needs to be configured as current package
registry.
An example for the configuration is present in the repository of the packages quick-start
boilerplate: [See here](http://ogs-hq-git.ogs.local/standard/shared/npm/boilerplate/-/blob/master/.npmrc)

After configuring the Nexus Registry, this package can be installed by using: ``npm i @ogs/ngx-keycloak``

# 4. Initialising
Import the library module in a module of our application:

```` typescript
...
@NgModule({
    ...
    imports: [
        ...
        KeycloakModule
        ...
    ]
    ...
})
...
````

This provides our application the ability to use all functionalities from this package.

# 5. Configuration
## 5.1 KeycloakConfig
For configure this package, we need to provide a configuration with the type of ``KeycloakConfig``. This configuration represents the customizations of the Keycloak-Workflow on our client-side.

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
		}
	    ...
    ]
    ...
})
...
````

### resource
The resource our client is accessing to. This option'll be appended into the requests' body as form data with the key "client_id".

### authServerUrl
The URL or Path to our auth server. Every endpoint from Keycloak will be appended to this.

### realm
The realm from Keycloak specifikation.

### guardFallbackUrl
Fallback-URL the user gets redirected to, when securing router with ``keycloakGuard`` and missing authentication.

### storageType
This property allows to specify, which storage should be used to store value.

### storageKey
This property enables the customization of the key, where the storage (if enabled) should store the values.

### useEmailAsCurrentUser
**This property is only for internal use.**\
With this property set to ``true``, the email given by ``KeycloakService.login()``'ll be used as currentUser HTTP requests header field as long as the ``KeycloakInterceptor`` is used.\
Default: ``false``

### timeout
This property is for controlling the HTTP request timeout (in milliseconds).\
Default: ``3000``

### expirationOffset
This property allows to add offset (in milliseconds) to the expiration of the Access Token.\
Default: ``3000``

# 6. KeycloakService
## 6.1 Initialization
To be able to use this Service, we need to provide it in a injection-context.

````typescript
private readonly _keycloakService: KeycloakService = inject(KeycloakService);
````

## 6.2 API
### 6.2.1 Methods
#### set notAuthorisedCallback(value: (() => void) | undefined)
This methods allows to add a callback to this service, that'll be executed if the user is not authorised by Keycloak.

Arguments:
- value: The callback, that'll be executed.

#### login(email: string, password: string, additionalsInRequest?: AdditionalsInRequest | undefined): Observable&lt;KeycloakTokens&gt;
This methods is used for authenticating a user by a given email and password.

Arguments:
- email: The given email by the user
- password: The given password by the user
- additionalsInRequest?: Additional HTTP header and body values.

Returns: The ``KeycloakTokens`` of the newly created Keycloak session as ``Observable``.

#### logout(additionalsInRequest?: AdditionalsInRequest | undefined): Observable&lt;void&gt;
This methods is used to logout the currently logged in user.

Arguments:
- additionsInRequest?: Additional HTTP header and body values.

Returns: An ``Observable``

#### init(additionalsInRequest?: AdditionalsInRequest | undefined): void
Initializing the Access Token update procedure by calling this method.

Arguments:
- additionsInRequest?: Additional HTTP header and body values.

#### validateCredentials(email: string, password: string, additionalsInRequest?: AdditionalsInRequest | undefined): Observable&lt;void&gt;
Validate credentials of an user by creating a new Keycloak session.\
If the given credentials are valid, then the Keycloak Session'll be invalidated by revoking the Access Tokens of the created Keycloak session.\
Otherwise, a new Keycloak session could not be created and a revokation is void.

Arguments:
- email: The given email by the user
- password: The given password by the user
- additionalsInRequest?: Additional HTTP header and body values.

Returns: An ``Observable``

#### revokeRefreshToken(overwriteRefreshToken?: string | undefined): Observable&lt;void&gt;
Revoke a saved or overwritten Refresh Token by Keycloak since it is allowed by Keycloak.\
For the OAuth Revoke Specifications: [See here](https://datatracker.ietf.org/doc/html/rfc7009#autoid-4)

Arguments:
- overwriteRefreshToken?: Optional Refresh Token, that'll be revoked. If it is not set, the currently issued Refresh Token will be used.

Returns: An ``Observable``

#### revokeAccessToken(overwriteAccessToken?: string | undefined): Observable&lt;void&gt;
Revoke a saved or overwritten Access Token by Keycloak.\
For the OAuth Revoke Specifications: [See here](https://datatracker.ietf.org/doc/html/rfc7009#autoid-4)

Arguments:
- overwriteAccessToken?: Optional Access Token, that'll be revoked. If it is not set, the currently issued Access Token will be used.

Returns: An ``Observable``

#### isAuthorized(): boolean
Check if the user is authorized.

Returns: ``true``, if the user is authorized. Othwerise ``false``.

# 7. KeycloakStoreService
## 7.1 Initialization
To be able to use this Service, we need to provide it in a injection-context.

````typescript
private readonly _keycloakStoreService: KeycloakStoreService = inject(KeycloakStoreService);
````

## 7.2 API
### 7.2.1 Methods
#### clear(): void
By calling this method, the whole storage will be cleared.

#### get email(): string | null
Getter for getting the email, which is in the storage.

Returns: ``string`` if the email is present. Otherwise ``null``.

#### set email(email: string | null)
Setter for setting the email in the storage.

Arguments:
- email: The email, that should be stored.

#### get tokens(): KeycloakTokens | null
Getter for getting the tokens (Access Token & Refresh Token), which are in the storage.

Returns: ``KeycloakTokens`` if the tokens are present. Otherwise ``null``.

#### set tokens(tokens: KeycloakTokens | null)
Setter for setting the tokens (Access Token & Refresh Token) in the storage.

Arguments:
- The tokens, that should be stored.

#### get accessToken(): string | undefined
Getter for getting the Access Token, that is stored in the storage.

Returns: ``string``, that represents the Access Token, if the Access Token is present in the storage. Otherwise ``undefined``.

#### get refreshToken(): string | undefined
Getter for getting the Refresh Token, that is stored in the storage.

Returns: ``stirng``, that represents the Refresh Token, if the Refresh Token is present in the storage. Otherwise ``undefined``.

#### get TTLOfAccessToken(): number
Getter for getting the TTL of Access Token.

Default: ``300``\
Returns: ``number``, that represents the TTL of the Access Token, if the Access Token is present in the storage. Otherwise the default value.

#### get remainingTTLOfAccessToken(): number
Getter for getting the remaining TTL of Access Token.

Default: ``300``\
Returns: ``number``, that represents the remaining TTL of the Access Token, if the Access Token is present in the storage. Otherwise the default value.

#### get remainingTTLOfRefreshToken(): number
Getter for getting the remaining TTL of Refresh Token.

Default: ``1800``\
Returns: ``number``, that represents the remaining TTL of the Refresh Token, if the Refresh Token is present in the
storage. Otherwise the default value.

#### get parsedAccessToken(): ParsedKeycloakToken | null
Getter for getting the Base64Url-decoded Access Token.

Returns ``ParsedKeycloakToken`` if the Access Token could be decoded. Otherwise ``null``.

#### get parsedRefreshToken(): ParsedKeycloakToken | null
Getter for getting the Base64Url-decoded Refresh Token.

Returns ``ParsedKeycloakToken`` if the Refresh Token could be decoded. Otherwise ``null``.
