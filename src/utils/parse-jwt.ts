/**
 * Parses a JWT (JSON Web Token) and returns its payload as an object of type T.
 * @param token - The JWT string to be parsed.
 * @typeParam T - The expected type of the JWT payload.
 *
 * @since 1.0.0
 * @author Simon Kovtyk
 */
/* eslint-disable-next-line @tseslint/no-unnecessary-type-parameters */
export function parseJWT<T> (token: string): T {
  const base64Url: string | undefined = token.split(".")[ 1 ];

  if (base64Url === undefined)
    throw new Error("JWT can not be parsed.");


  const base64: string = base64Url.replaceAll('-', "+").replaceAll('_', "/");
  const jsonPayload: string = decodeURIComponent(
    [ ...window.atob(base64) ]
      .map(function (c: string): string {
        /* eslint-disable-next-line @tseslint/no-non-null-assertion */
        return `%${ `00${ c.codePointAt(0)!.toString(16) }`.slice(-2) }`;
      })
      .join("")
  );

  return JSON.parse(jsonPayload) as T;
}
