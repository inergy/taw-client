import { merge } from 'lodash'

import common from './common'

export default merge(common, {
  api: {
    host: 'home.caycecollins.com',
  },
  cerebral: {
    debugger: true,
    remote: 'localhost:8585',
  },
  webpack: { // webpack-dev-server
    host: '0.0.0.0', // open to all network interfaces, use 'localhost' to restrict
    port: 9000,
    compress: true, // gzip compression
  },
})
