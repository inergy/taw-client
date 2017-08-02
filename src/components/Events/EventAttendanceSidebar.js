import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { connect } from 'cerebral/react'
import { state } from 'cerebral/tags'

const EventAttendanceSidebar = props =>
  <Container>
    Attendance
  </Container>

EventAttendanceSidebar.propTypes = {
  event: PropTypes.object,
  userTimezone: PropTypes.string,
}

export default connect(
  {
    event: state`events.eventData`,
  },
  EventAttendanceSidebar
)

const Container = styled.div`
  display: flex;
  flex-direction: column;
  font-sizeE: 0.9rem;
  color: ${props => props.theme.colors.armyWhite};
`