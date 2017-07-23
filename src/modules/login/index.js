import { when } from 'cerebral/operators'
import { state } from 'cerebral/tags'
import { goTo } from '@cerebral/router/operators'

import authenticate from '../authorization/chains/authenticate'
import changeView from '../../factories/changeView'

export default {
  state: {
    authForm: {
      callsign: {
        value: '',
        isRequired: true,
        validationRules: [
          'minLength:3',
          'isValue',
        ],
      },
      password: {
        type: 'password',
        value: '',
        isRequired: true,
        validationRules: [
          'minLength:6',
          'isValue',
        ],
      },
      showErrors: true,
    },
  },
  signals: {
    routed: [
      when(state`authorization.authenticated`), {
        true: goTo('/'),
        false: changeView('login'),
      },
    ],
    login: authenticate,
  },
}
