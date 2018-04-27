/**
 * Dropdown menu for spreadsheet columns. Calls respective spreadsheet methods
 * when menu items are clicked.
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown } from 'semantic-ui-react'
import { VIZUAL } from '../../../util/Vizual';


class ColumnDropDown extends React.Component {
    static propTypes = {
        disabled: PropTypes.bool.isRequired,
        columnId: PropTypes.number.isRequired,
        columnIndex: PropTypes.number.isRequired,
        onAction: PropTypes.func.isRequired
    }
    /**
     * Call spreadsheet delete column method.
     */
    deleteColumn = () => {
        const { columnId, onAction } = this.props
        onAction(VIZUAL.DELETE_COLUMN, columnId);
    }
    /**
     * Call spreadsheet insert column method.
     */
    insertColumnLeft = () => {
        const { columnIndex, onAction } = this.props
        onAction(VIZUAL.INSERT_COLUMN, columnIndex);
    }
    /**
     * Call spreadsheet insert column method.
     */
    insertColumnRight = () => {
        const { columnIndex, onAction } = this.props
        onAction(VIZUAL.INSERT_COLUMN,  (columnIndex + 1));
    }
    /**
     * Call spreadsheet move column method.
     */
    moveColumn = () => {
        const { columnId, onAction } = this.props
        onAction(VIZUAL.MOVE_COLUMN, columnId);
    }
    render() {
        const { disabled } = this.props;
        return (
            <Dropdown disabled={disabled} floating>
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
                </Dropdown.Menu>
            </Dropdown>
        );
    }
}

export default ColumnDropDown;
