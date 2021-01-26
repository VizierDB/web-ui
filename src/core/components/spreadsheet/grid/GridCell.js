/**
 * Copyright (C) 2018 New York University
 *                    University at Buffalo,
 *                    Illinois Institute of Technology.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react'
import PropTypes from 'prop-types'
import GridInput from './GridInput';
import { Icon } from 'semantic-ui-react';

class GridCell extends React.Component {
    static propTypes = {
        column: PropTypes.object.isRequired,
        columnIndex: PropTypes.number.isRequired,
        hasAnnotations: PropTypes.bool.isRequired,
        isActive: PropTypes.bool.isRequired,
        isUpdating: PropTypes.bool.isRequired,
        rowId: PropTypes.string.isRequired,
        rowIndex: PropTypes.number,
        value: PropTypes.oneOfType([
             PropTypes.string,
             PropTypes.number,
             PropTypes.bool
         ]),
         onClick: PropTypes.func,
         onMove: PropTypes.func,
         onUpdate: PropTypes.func,
         onFetchAnnotations: PropTypes.func
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
    /**
     * Cell info click handler. Check if a onFetchAnnotations handler was provided from the
     * parent. Call it with the cell id and coordinates.
     */
    handleFetchAnnotations = () => {
        const { columnIndex, rowId, onFetchAnnotations } = this.props;
        if (onFetchAnnotations != null) {
        	onFetchAnnotations(columnIndex, rowId);
        }
    }
    render() {
        const { hasAnnotations, isActive, isUpdating, value, onUpdate } = this.props;
        // The cell style depends on whether the column is active or not.
        let cellCss = 'grid-cell';
        let annoIcon = null;
        if (isActive) {
            cellCss += ' active';
        } else if (isUpdating) {
            cellCss += ' updating';
        }
        if (hasAnnotations) {
            cellCss += ' highlight';
            annoIcon = ( <Icon
	            className='icon-button annotations-icon'
	            title='Caveats'
	            name='question circle outline'
	            onClick={this.handleFetchAnnotations}
	        />);
        }
        // The cell value depends on whether the cell is active and updatable
        let cellValue = null;
        // Get a string representation of the cell value. The value could be a
        // number, boolean, string or null.
        let strValue = null;
        if (value == null) {
            strValue = '';
        } else {
            strValue = value.toString();
        }
        if ((isActive) && (onUpdate != null)) {
            cellValue = (
                <GridInput
                    cellValue={strValue}
                    onMove={this.handleMove}
                    onUpdate={this.handleChange}
                />
            );
        } else {
            if (value == null) {
                cellCss += '  is-null';
            }
            cellValue = (<div className='cell-value' onClick={this.handleClick}>{strValue}</div>);
        }
        return (
            <td className={cellCss} >
                {annoIcon}
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
