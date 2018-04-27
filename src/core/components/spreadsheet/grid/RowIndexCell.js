import React from 'react'
import PropTypes from 'prop-types'
import RowDropDown from '../menu/RowDropDown';

/**
 * Left-hand column in the grid that contains the row index and context menu.
 */
class RowIndexCell extends React.Component {
    static propTypes = {
        disabled: PropTypes.bool.isRequired,
        rowIndex: PropTypes.number.isRequired,
        value: PropTypes.oneOfType([
             PropTypes.string,
             PropTypes.number
         ]),
         onAction: PropTypes.func,
         onClick: PropTypes.func
    }
    /**
     * Render grod column as Html table header cell.
     */
    render() {
        const { disabled, rowIndex, value, onAction, onClick } = this.props;
        // Show a dropdown menu if onAction method is provided
        let dropdown = null;
        if (onAction != null) {
            dropdown = (
                <RowDropDown
                    disabled={disabled}
                    rowIndex={rowIndex}
                    onAction={onAction}
                />
            );
        }
        return (
            <td className='grid-row-index' onClick={onClick}>
                {value}
                { dropdown }
            </td>
        );
    }
}

RowIndexCell.defaultProps = {
    disabled: false,
    rowIndex: -1
}


export default RowIndexCell;
