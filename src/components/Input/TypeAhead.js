import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import { rgba } from 'polished'
import reactStringReplace from 'react-string-replace'
import { replace, debounce } from 'lodash'

import { Label, sharedInputStyles } from './index'

export default class TypeAhead extends Component {
  state = {
    dropdownOpen: false,
    highlightedIndex: -1,
    inputValue: '',
    lastScrollPosition: 0,
  }

  static defaultProps = {
    autoComplete: null,
    items: null,
    type: 'text',
  }

  static propTypes = {
    autoComplete: PropTypes.string,
    defaultValue: PropTypes.string,
    disabled: PropTypes.bool,
    items: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.number,
      value: PropTypes.any,
    })),
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    reset: PropTypes.bool, // TODO: change to 'value' (set to empty string for 'reset')
    spellCheck: PropTypes.string,
    type: PropTypes.string.isRequired,
    onSelect: PropTypes.func,
    className: PropTypes.string,
    size: PropTypes.string,
    label: PropTypes.string,
  }

  toggleDropdown = (truth) => {
    this.setState({ dropdownOpen: truth })
  }

  componentWillMount () {
    this.setState({
      inputValue: this.props.defaultValue || '',
    })
  }

  componentDidUpdate () {
    if (this.dropdown) this.dropdown.scrollTop = this.state.lastScrollPosition
  }

  inputChanged = (e) => {
    if (e.target.value.length > 0) {
      this.setState({
        inputValue: e.target.value,
        highlightedIndex: -1,
      })

      if (!this.state.dropdownOpen) {
        this.toggleDropdown(true)
      }
    } else {
      this.toggleDropdown(false)
      this.setState({
        inputValue: '',
        highlightedIndex: -1,
      })
    }
    this.props.onChange && this.props.onChange(e)
  }

  itemSelected = item => {
    this.props.onSelect && this.props.onSelect(item)
    setTimeout(() => {
      this.toggleDropdown(true)
      this.input.focus()
    }, 0)
  }

  keyDown = e => {
    const ARROW_UP = 38
    const ARROW_DOWN = 40
    const ENTER_KEY = 13
    const ESC_KEY = 27
    switch (e.keyCode) {
      case ARROW_UP:
        e.preventDefault()
        this.handleKey('up', e)
        break
      case ARROW_DOWN:
        e.preventDefault()
        this.handleKey('down', e)
        break
      case ENTER_KEY:
        e.preventDefault()
        this.state.highlightedIndex > -1
          ? this.itemSelected(this.props.items[this.state.highlightedIndex])
          : this.toggleDropdown(false)
        break
      case ESC_KEY:
        this.toggleDropdown(false)
        break
    }
  }

  handleKey = (direction, event) => {
    let highlightedIndex = this.state.highlightedIndex
    let items = this.props.items
    let newIndex = highlightedIndex
    if (items.length > 0) {
      if (this.state.dropdownOpen) {
        if (direction === 'up' && highlightedIndex > 0) {
          newIndex = highlightedIndex - 1
        }
        if (direction === 'down' && highlightedIndex < items.length - 1) {
          newIndex = highlightedIndex + 1
        }
        this.setState({
          highlightedIndex: newIndex,
        })
      } else {
        this.setState({ inputValue: items[newIndex].value })
        this.toggleDropdown(true)
      }
    }
  }

  debouncedScroll = debounce((e) => {
    this.setState({
      lastScrollPosition: e.target.scrollTop,
    })
  }, 200)

  trackScroll = e => {
    e.persist()
    this.debouncedScroll(e)
  }

  InputDropdown = () => {
    const items = this.props.items.map(item => {
      // replace spaces with proper html character codes (prevents spaces being removed after string replacement)
      const inputValueWithEntities = replace(this.state.inputValue, / /g, '\u00a0')
      const itemValueWithEntities = replace(item.value, / /g, '\u00a0')
      const renderValue = reactStringReplace(itemValueWithEntities, inputValueWithEntities, (match, i) => (
        <MatchingText key={i}>{match}</MatchingText>
      ))
      return ({ key: item.key, value: item.value, renderValue: renderValue, exists: item.exists })
    })
    return (
      <Dropdown
        isOpen={this.state.dropdownOpen}
        toggle={() => this.toggleDropdown(true)}
        innerRef={element => { this.dropdown = element }}
        onScroll={this.trackScroll}
        scrollTop={this.state.lastScrollPosition}
      >
        <ListGroup>
          {items.map((item, index) => {
            return (
              <ListGroupItem
                highlighted={index === this.state.highlightedIndex}
                key={item.key}
                onMouseDown={() => this.itemSelected(this.props.items[index])}
                exists={item.exists}
              >
                {item.renderValue} {item.exists && ' [invited]'}
              </ListGroupItem>
            )
          }
          )}
        </ListGroup>
      </Dropdown>
    )
  }

  onBlur = () => {
    this.toggleDropdown(false)
  }

  onFocus = () => {
    this.toggleDropdown(true)
  }

  render () {
    return (
      <TypeAheadContainer>
        <InputGroup size={this.props.size}>
          {this.props.label &&
            <Label isPristine={true}>
              {this.props.label}
            </Label>
          }
          <StyledInput
            autoComplete={this.props.autoComplete}
            disabled={this.props.disabled}
            innerRef={input => this.input = input}
            onBlur={this.onBlur}
            onFocus={this.onFocus}
            onChange={this.inputChanged}
            onKeyDown={this.keyDown}
            placeholder={this.props.placeholder}
            spellCheck={this.props.spellCheck}
            type={this.props.type}
            value={this.state.inputValue}
            className={this.props.className}
            size={this.props.size}
          />
          {(this.props.items && this.props.items.length > 0 && this.state.dropdownOpen) && this.InputDropdown()}
        </InputGroup>
      </TypeAheadContainer>
    )
  }
}

const MatchingText = styled.span`
  font-weight: ${props => !props.theme.colors.lightTan ? 'bold' : 'normal'};;
  color: ${props => props.theme.colors.lightTan || '#000'};
`

const ListGroup = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`

const TypeAheadContainer = styled.div`
  position: relative;
  width: 100%;
  margin-top: 24px;
`

const InputGroup = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: ${props => props.size || 'auto'};
`

const StyledInput = styled.input`
  position: relative;
  width: 100%;
  ${sharedInputStyles}
`

const ListGroupItem = styled(({ exists, highlighted, ...args }) => <li {...args} />)`
  list-style-type: none;
  padding: 12px 0 12px 12px;
  font-size: 0.9rem;
  color: ${props => props.highlighted ? props.theme.colors.darkGray2 : props.theme.colors.armyGreen};
  background: ${props => props.highlighted && props.theme.colors.lightTan};
  border: 0;
  margin-bottom: 0;
  white-space: nowrap;
  &:first-child {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
  &:not(:last-child) {
    border-bottom: ${props => props.theme.colors.darkGray4};
  }
  &:hover {
    cursor: pointer;
    color: ${props => !props.highlighted && props.theme.colors.armyWhite};
    ${props => !props.highlighted && `background-color: ${rgba(props.theme.colors.armyGreen, 0.5)};`}
  }
  > span {
    ${props => props.highlighted && `color: ${props.theme.colors.darkGray2};`}
  }
  ${props => props.exists && css`
    color: ${props.theme.colors.gray};
    background: ${props.theme.colors.darkGray2};
    &:hover {
      color: ${props.theme.colors.gray};
      background: ${props.theme.colors.darkGray2};
      cursor: default;
      > span {
        color: ${props.theme.colors.gray};
      }
    }
    > span {
      color: ${props.theme.colors.gray};
    }
  `}
`

const Dropdown = styled.div`
  position: absolute;
  width: 100%;
  max-height: 368px;
  top: 56px;
  border-radius: 0 0 2px 2px;
  background-color: ${props => props.theme.colors.darkGray2};
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 9999;
  transition: all .3s cubic-bezier(.4,0,.2,1);
  @media (max-width: 600px) {
    position: relative;
    top: 0;
  }
`
