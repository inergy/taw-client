import moment from 'moment'

import getRecurringInfo from '../helpers/getRecurringInfo'

export default function editEvent ({ controller, props, state, http, forms }) {
  state.set(`${props.form}.pending`, true)
  state.unset(`${props.form}.error`)
  const form = forms.get(props.form)
  const eventID = state.get('events.eventData.id')
  const difference = moment(form.end.value).diff(moment(form.start.value))
  const duration = moment.duration(difference).minutes()
  const recurring = form.repeat.value ? getRecurringInfo(form) : []
  const participants = state.get(`${props.form}.participants`)
  const formToSend = {
    id: eventID,
    title: form.title.value,
    description: form.description.value,
    mandatory: form.mandatory.value || false,
    start: form.start.value,
    startTime: moment(form.start.value).format('hh:mm'),
    end: form.end.value,
    type: 'Meeting',
    duration,
    recurring,
    participants: participants && participants.length > 0 ? participants : ['none'],
    unit: { id: parseInt(form.unit.value) },
  }
  console.log(formToSend)
  return http.put(`/events/${eventID}`, formToSend)
    .then(response => {
      console.log(response)
      // const sidebarActiveToggled = controller.getSignal('app.sidebarActiveToggled')
      // sidebarActiveToggled({ value: false })
      state.set(`${props.form}.pending`, false)
      forms.reset(props.form)
    }).catch(rawError => {
      const error = JSON.stringify(rawError)
      console.log(JSON.parse(error))
      setTimeout(() => state.set(`${props.form}.pending`, false), 500)
      setTimeout(() => state.set(`${props.form}.error`, JSON.parse(error)), 500)
    })
}
