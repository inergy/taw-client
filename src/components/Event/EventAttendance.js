import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { connect } from 'cerebral/react'
import { state } from 'cerebral/tags'
import moment from 'moment-timezone'

const EventAttendance = props =>
  <Container>
    Attendance
  </Container>

EventAttendance.propTypes = {
  event: PropTypes.object,
  userTimezone: PropTypes.string,
}

export default connect(
  {
    event: state`event.data`,
  },
  EventAttendance
)

const Container = styled.div`
  display: flex;
  flex-direction: column;
  font-sizeE: 0.9rem;
  color: ${props => props.theme.colors.armyWhite};
`