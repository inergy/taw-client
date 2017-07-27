import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { connect } from 'cerebral/react'
import { signal, state } from 'cerebral/tags'
import moment from 'moment-timezone'
import { Grid, Row, Col } from 'react-material-responsive-grid'
import confirmDatePlugin from 'flatpickr/dist/plugins/confirmDate/confirmDate'

import Form from '../Form'
import Input from '../Input'
import Button from '../Button'
import TypeAhead from '../Input/TypeAhead'

const formPath = 'events.createEvent'

const roundDate = (date, duration, method, userTimezone) => {
  const rounded = moment(Math[method]((+date) / (+duration)) * (+duration))
  const converted = moment(rounded).tz(userTimezone).toDate()
  return converted
}

const dateConfigOptions = (props, field) => {
  const options = {
    enableTime: true,
    time_24hr: !!props.userHourFormat || true,
    plugins: [new confirmDatePlugin({
      showAlways: false,
      confirmIcon: '<i class="fa fa-check"></i>',
      confirmText: 'Done',
    })],
  }
  if (field === 'start') {
    options.minDate = roundDate(moment(), moment.duration(15, 'minutes'), 'ceil', props.userTimezone)
  }
  if (field === 'end') {
    options.minDate = props.startDate ? moment(props.startDate).add(15, 'minutes').format() : roundDate(moment(), moment.duration(30, 'minutes'), 'ceil', props.userTimezone)
    // prevent end date/time existing prior to start date/time
    if (props.startDate) {
      let difference = 0
      if (props.endDate) {
        difference = moment(props.endDate).diff(moment(props.startDate))
      }
      if (difference < 900000) {
        props.fieldChanged({
          field: `${formPath}.end`,
          value: options.minDate,
        })
      }
    }
  }
  return options
}

const searchOnChange = (props, e) => {
  props.filterSearchInput({ value: e.target ? e.target.value : e })
}

const getDuration = props => {
  let difference = moment(props.endDate).diff(moment(props.startDate))
  let duration = moment.duration(difference)
  let durationDisplay = ''
  if (duration.days() > 0) durationDisplay += duration.days() + 'd '
  if (duration.hours() > 0) durationDisplay += duration.hours() + 'h '
  if (duration.minutes() > 0) durationDisplay += duration.minutes() + 'm'
  if (durationDisplay) return 'Duration: ' + durationDisplay
}

const getUserUnits = props => {
  const units = props.divisions.map((unit, index) => {
    return (
      <option
        key={index}
        value={unit.id}
      >
        {unit.name}
      </option>
    )
  })
  units.unshift(<option key="empty" value="">Select Unit</option>)
  return units
}

const CreateEvent = props => {
  const duration = (props.startDate && props.endDate) && getDuration(props)
  return (
    <CreateEventContainer>
      <Form>
        <Grid marginless>
          <StyledRow>
            <Col sm={6} sm8={4} xs4={4}>
              <Input
                label="title"
                path={`${formPath}.title`}
                width={300}
              />
              <Input
                label="description"
                type="textarea"
                path={`${formPath}.description`}
                width={300}
                height={100}
              />
              <Input
                label="mandatory"
                type="checkbox"
                path={`${formPath}.mandatory`}
              />
              <Input
                label="start date"
                type="date"
                path={`${formPath}.start`}
                dateOptions={dateConfigOptions(props, 'start')}
              />
              <Input
                label="end date"
                type="date"
                path={`${formPath}.end`}
                dateOptions={dateConfigOptions(props, 'end')}
              />
              {duration &&
                <Duration>
                  {duration}
                </Duration>
              }
              <Input
                label="repeat"
                type="checkbox"
                path={`${formPath}.repeat`}
              />
              {props.repeatEnabled && ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((weekday, index) =>
                <Input
                  key={`repeat-${weekday}`}
                  label={weekday}
                  name="repeatWeekday"
                  type="checkbox"
                  is="checkbox-group"
                  path={`${formPath}.repeatWeekly.${weekday}`}
                  value={weekday}
                />
              )}
            </Col>
            <Col sm={6} sm8={4}>
              <Input
                type="select"
                label="Hosting Unit"
                path={`${formPath}.unit`}
              >
                {props.divisions && getUserUnits(props)}
              </Input>
              <TypeAhead
                label="Invite Member or Unit"
                autoComplete="off"
                items={props.search && props.search.map(it => ({ key: it.id, value: it.name || it.callsign, type: it.callsign ? 'user' : 'unit', exists: it.exists }))}
                onChange={e => searchOnChange(props, e)}
                onSelect={e => props.addParticipant({ participant: e })}
                spellCheck="false"
                size="100%"
              />
              <Participants>
                {props.participants && props.participants.length > 0 && props.participants.map((participant, index) =>
                  <Participant key={index}>
                    <div>{participant.display}</div>
                    <RemoveParticipantButton
                      onClick={e => props.removeParticipant(participant)}
                      icon="remove"
                      outline={false}
                    />
                  </Participant>
                )}
              </Participants>
            </Col>
          </StyledRow>
          {/* <Row>
            <Button
              onClick={() => props.resetForm({ formPath })}
              label="Reset"
              type="button"
            />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <SubmitButton form={formPath} />
            {props.underConstruction && <ErrorMessage>Under construciton, check back soon.</ErrorMessage>}
          </Row> */}
        </Grid>
      </Form>
    </CreateEventContainer>
  )
}

CreateEvent.propTypes = {
  userTimezone: PropTypes.string,
  userUnitID: PropTypes.number,
  userHourFormat: PropTypes.string,
  resetForm: PropTypes.func,
  repeatEnabled: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
  ]),
  underConstruction: PropTypes.bool,
  filterSearchInput: PropTypes.func,
  divisions: PropTypes.array,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  fieldChanged: PropTypes.func,
  search: PropTypes.array,
  participants: PropTypes.array,
  addParticipant: PropTypes.func,
}

export default connect(
  {
    userTimezone: state`user.timezone`,
    userUnitID: state`user.highestPosition.unit.id`,
    startDate: state`${formPath}.start.value`,
    endDate: state`${formPath}.end.value`,
    divisions: state`units.divisions`,
    search: state`search.results`,
    userHourFormat: state`user.timeformat`,
    repeatEnabled: state`${formPath}.repeat.value`,
    underConstruction: state`${formPath}.underConstruction`,
    participants: state`${formPath}.participants`,
    resetForm: signal`app.onReset`,
    filterSearchInput: signal`events.filterSearchInput`,
    fieldChanged: signal`app.fieldChanged`,
    addParticipant: signal`events.createEventAddParticipant`,
    removeParticipant: signal`events.createEventRemoveParticipant`,
  },
  CreateEvent
)

const CreateEventContainer = styled.div`
  font-sizeE: 0.9rem;
  color: ${props => props.theme.colors.armyWhite};
`

const StyledRow = styled(Row)`
  overflow: hidden;
`

const Duration = styled.div`
  padding: 16px 0;
  color: ${props => props.theme.colors.gray};
`

const Participants = styled.div`
  width: 100%;
`

const Participant = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 32px;
  padding: 8px 16px;
`

const RemoveParticipantButton = styled(Button)`
  color: ${props => props.theme.colors.lightRed};
`
