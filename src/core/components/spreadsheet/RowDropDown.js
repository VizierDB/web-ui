/**
 * Dropdown menu for spreadsheet rows. Calls respective spreadsheet methods
 * when menu items are clicked.
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown } from 'semantic-ui-react'


class RowDropDown extends React.Component {
    static propTypes = {
        rowIndex: PropTypes.number.isRequired,
        spreadsheet: PropTypes.object.isRequired
    }
    /**
     * Call spreadsheet delete row method.
     */
    deleteRow = () => {
        const { rowIndex, spreadsheet } = this.props
        spreadsheet.deleteRow(rowIndex)
    }
    /**
     * Call spreadsheet insert row method.
     */
    insertRowAbove = () => {
        const { rowIndex, spreadsheet } = this.props
        spreadsheet.insertRow(rowIndex)
    }
    /**
     * Call spreadsheet insert row method.
     */
    insertRowBelow = () => {
        const { rowIndex, spreadsheet } = this.props
        spreadsheet.insertRow(rowIndex + 1)
    }
    /**
     * Call spreadsheet move row method.
     */
    moveRow = () => {
        const { rowIndex, spreadsheet } = this.props
        spreadsheet.moveRow(rowIndex)
    }
    render() {
        return (<Dropdown floating>
            <Dropdown.Menu>
                <Dropdown.Item
                    icon='arrow up'
                    content='Insert row above'
                    onClick={this.insertRowAbove}
                />
                <Dropdown.Item
                    icon='arrow down'
                    content='Insert row below'
                    onClick={this.insertRowBelow}
                />
                <Dropdown.Item
                    icon='trash'
                    content='Delete row'
                    onClick={this.deleteRow}
                />
                <Dropdown.Item
                    icon='move'
                    content='Move row'
                    onClick={this.moveRow}
                />
            </Dropdown.Menu>
        </Dropdown>)
    }
}

export default RowDropDown
