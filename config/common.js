/*
  common.js

  Provides a common configuration object which is exposed to the web client.
  This module is imported within specific environment configuration files in this directory.
*/

export default {
  api: {
    protocol: 'http',
    host: 'localhost',
    port: 5000,
    baseUrl: 'api',
  },
}
