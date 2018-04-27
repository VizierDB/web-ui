/**
 * Dropdown menu for spreadsheet rows. Calls respective spreadsheet methods
 * when menu items are clicked.
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown } from 'semantic-ui-react'
import { VIZUAL } from '../../../util/Vizual';


class RowDropDown extends React.Component {
    static propTypes = {
        disabled: PropTypes.bool.isRequired,
        rowIndex: PropTypes.number.isRequired,
        onAction: PropTypes.func.isRequired
    }
    /**
     * Call spreadsheet delete row method.
     */
    deleteRow = () => {
        const { rowIndex, onAction } = this.props
        onAction(VIZUAL.DELETE_ROW, rowIndex);
    }
    /**
     * Call spreadsheet insert row method.
     */
    insertRowAbove = () => {
        const { rowIndex, onAction } = this.props
        onAction(VIZUAL.INSERT_ROW, rowIndex);
    }
    /**
     * Call spreadsheet insert row method.
     */
    insertRowBelow = () => {
        const { rowIndex, onAction } = this.props
        onAction(VIZUAL.INSERT_ROW, (rowIndex + 1));
    }
    /**
     * Call spreadsheet move row method.
     */
    moveRow = () => {
        const { rowIndex, onAction } = this.props
        onAction(VIZUAL.MOVE_ROW, rowIndex);
    }
    render() {
        const { disabled } = this.props;
        return (
            <Dropdown disabled={disabled} floating>
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
            </Dropdown>
        );
    }
}

export default RowDropDown;
