import React from 'react'
import PropTypes from 'prop-types'
import GridInput from './GridInput';
import ColumnDropDown from '../menu/ColumnDropDown';
import { MOVE } from '../../../util/App';


/**
 * Column header in a spreadsheet grid.
 */
class HeaderCell extends React.Component {
    static propTypes = {
        column: PropTypes.object.isRequired,
        columnIndex: PropTypes.number.isRequired,
        disabled: PropTypes.bool.isRequired,
        isActive: PropTypes.bool.isRequired,
        isUpdating: PropTypes.bool.isRequired,
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]),
        onAction: PropTypes.func,
        onClick: PropTypes.func,
        onMove: PropTypes.func,
        onUpdate: PropTypes.func
    }
    /**
     * Submit changes to the cell value if a onUpdate handler is given.
     */
    handleChange = (value) => {
        const { onUpdate } = this.props;
        if (onUpdate != null) {
            onUpdate(value);
        }
    }
    /**
     * Cell click handler. Check if a onClick handler was provided from the
     * parent. Call it with the column id and and index position.
     */
    handleClick = () => {
        const { column, columnIndex, onClick } = this.props;
        if (onClick != null) {
            onClick(column.id, -1, columnIndex, -1);
        }
    }
    /**
     * Active cell move handler. Call the provided handler (if given). Header
     * cells only support left or right moves. Move up is converted to move left
     * and move down is converted to move right.
     */
    handleMove = (direction) => {
        const { onMove } = this.props;
        if (onMove != null) {
            if ((direction === MOVE.LEFT) || (direction === MOVE.UP)) {
                onMove(MOVE.LEFT);
            } else if ((direction === MOVE.RIGHT) || (direction === MOVE.DOWN)) {
                onMove(MOVE.RIGHT);
            }
        }
    }
    /**
     * Render grid column cell as Html table header cell.
     */
    render() {
        const {
            disabled,
            isActive,
            isUpdating,
            column,
            columnIndex,
            value,
            onAction
        } = this.props;
        // The value is optional (providing a value other than the column name
        // is used to override the column name while updating).
        let columnName = null;
        if (value != null) {
            columnName = value;
        } else {
            columnName = column.name;
        }
        // The cell style and content depends on whether the column is active
        // or not.
        let cellCss = 'grid-header';
        let cellValue = null;
        // Show optional dropdown menu if onAction handler is provided
        let dropdown = null;
        if (isActive) {
            // Show a text input control when active
            cellCss += ' active';
            cellValue = (
                <GridInput
                    cellValue={column.name}
                    onMove={this.handleMove}
                    onUpdate={this.handleChange}
                />
            );
        } else {
            if (onAction) {
                dropdown = (
                    <ColumnDropDown
                        columnId={column.id}
                        columnIndex={columnIndex}
                        disabled={disabled}
                        onAction={onAction}
                    />
                );
            }
            // Change style for header cells that are currently being updated.
            if (isUpdating) {
                cellCss += ' updating';
            }
            cellValue = (
                <span className='header-value'>
                    {columnName}
                </span>
            );
        }
        return (
            <th className={cellCss} onClick={this.handleClick}>
                {cellValue}
                {dropdown}
            </th>
        );
    }
}


HeaderCell.defaultProps = {
    disabled: false,
    isActive: false,
    isUpdating: false
}

export default HeaderCell;