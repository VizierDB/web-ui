/**
 * Dropdown menu for spreadsheet columns. Calls respective spreadsheet methods
 * when menu items are clicked.
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown } from 'semantic-ui-react'


class ColumnDropDown extends React.Component {
    static propTypes = {
        columnIndex: PropTypes.number.isRequired,
        spreadsheet: PropTypes.object.isRequired
    }
    /**
     * Call spreadsheet delete column method.
     */
    deleteColumn = () => {
        const { columnIndex, spreadsheet } = this.props
        spreadsheet.deleteColumn(columnIndex)
    }
    /**
     * Call spreadsheet insert column method.
     */
    insertColumnLeft = () => {
        const { columnIndex, spreadsheet } = this.props
        spreadsheet.insertColumn(columnIndex)
    }
    /**
     * Call spreadsheet insert column method.
     */
    insertColumnRight = () => {
        const { columnIndex, spreadsheet } = this.props
        spreadsheet.insertColumn(columnIndex + 1)
    }
    /**
     * Call spreadsheet move column method.
     */
    moveColumn = () => {
        const { columnIndex, spreadsheet } = this.props
        spreadsheet.moveColumn(columnIndex)
    }
    /**
     * Call spreadsheet rename column method.
     */
    renameColumn = () => {
        const { columnIndex, spreadsheet } = this.props
        spreadsheet.renameColumn(columnIndex)
    }
    render() {
        return (<Dropdown floating>
            <Dropdown.Menu>
                <Dropdown.Item
                    icon='arrow left'
                    content='Insert column to left'
                    onClick={this.insertColumnLeft}
                />
                <Dropdown.Item
                    icon='arrow right'
                    content='Insert column to right'
                    onClick={this.insertColumnRight}
                />
                <Dropdown.Item
                    icon='trash'
                    content='Delete column'
                    onClick={this.deleteColumn}
                />
                <Dropdown.Item
                    icon='move'
                    content='Move column'
                    onClick={this.moveColumn}
                />
                <Dropdown.Item
                    icon='edit'
                    content='Rename column'
                    onClick={this.renameColumn}
                />
            </Dropdown.Menu>
        </Dropdown>)
    }
}

export default ColumnDropDown
