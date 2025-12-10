---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Keycloak"
  tagline: Authentication handled for you
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Reference
      link: /reference
    - theme: alt
      text: Github
      link: https://github.com/OGS-GmbH/ngx-keycloak

features:
  - title: Seamless Angular Integration
    details: Drop-in authentication solution for Angular applications with minimal configuration. Simple module import and configuration to get Keycloak working in your app.
  - title: Automatic Token Management
    details: Handles token refresh, expiration, and storage automatically. Built-in interceptors ensure your API calls always include valid authentication headers.
  - title: Complete Session Control
    details: Full authentication lifecycle management including login, logout, token revocation, and credential validation with OAuth 2.0 compliance.
---

