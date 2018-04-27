import React from 'react'
import PropTypes from 'prop-types'
import GridInput from './GridInput';


class GridCell extends React.Component {
    static propTypes = {
        column: PropTypes.object.isRequired,
        columnIndex: PropTypes.number.isRequired,
        isActive: PropTypes.bool.isRequired,
        isUpdating: PropTypes.bool.isRequired,
        rowId: PropTypes.number.isRequired,
        rowIndex: PropTypes.number.isRequired,
        value: PropTypes.oneOfType([
             PropTypes.string,
             PropTypes.number
         ]),
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
     * parent. Call it with the cell id and coordinates.
     */
    handleClick = () => {
        const { column, columnIndex, rowId, rowIndex, onClick } = this.props;
        if (onClick != null) {
            onClick(column.id, rowId, columnIndex, rowIndex);
        }
    }
    /**
     * Active cell move handler. Call the provided handler (if given).
     */
    handleMove = (direction) => {
        const { onMove } = this.props;
        if (onMove != null) {
            onMove(direction);
        }
    }
    render() {
        const { isActive, isUpdating, value } = this.props;
        // The cell style depends on whether the column is active or not.
        let cellCss = 'grid-cell';
        let cellValue = null;
        if (isActive) {
            cellCss += ' active';
            cellValue = (
                <GridInput
                    cellValue={value}
                    onMove={this.handleMove}
                    onUpdate={this.handleChange}
                />
            );
        } else if (isUpdating) {
            cellCss += ' updating';
            cellValue = (<div className='cell-value'>{value}</div>);
        } else {
            cellValue = (<div className='cell-value'>{value}</div>);
        }
        return (
            <td className={cellCss} onClick={this.handleClick}>
                {cellValue}
            </td>
        );
    }
}

GridCell.defaultProps = {
    isActive: false,
    isUpdating: false
}

export default GridCell;
