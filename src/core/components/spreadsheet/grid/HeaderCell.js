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
import ColumnDropDown from '../menu/ColumnDropDown';
import { MOVE } from '../../../util/App';
import { Label } from 'semantic-ui-react'
import { Draggable, Droppable } from 'react-drag-and-drop'
import { Icon } from 'semantic-ui-react';
import {
    VIZUAL
} from '../../../util/Vizual';
import PlotHeader from './PlotHeader';

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
        onUpdate: PropTypes.func,
        isEditing: PropTypes.bool,
        onMoveAction: PropTypes.func,
        isSpreadsheet: PropTypes.bool
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
    handleMoveDropBefore = (dropData, dropTargetData) => {
        const { onMoveAction } = this.props;
        const dropTargetDataValue = dropTargetData.currentTarget.attributes.data.value;
        onMoveAction(VIZUAL.MOVE_COLUMN,  parseInt(dropData['header-cell'], 10),  parseInt(dropTargetDataValue, 10));
    }
    handleMoveDropAfter = (dropData, dropTargetData) => {
        const { onMoveAction } = this.props;
        const dropTargetDataValue = dropTargetData.currentTarget.attributes.data.value;
        onMoveAction(VIZUAL.MOVE_COLUMN,  parseInt(dropData['header-cell'], 10),  parseInt(dropTargetDataValue, 10));
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
            onAction,
            isEditing,
            isSpreadsheet
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
        let dropTargetType = 'none';
        let dropTargetBefore = null;
        let dropTargetAfter = null;
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
            if((isEditing) && (isSpreadsheet)){
            	dropTargetType = 'header-cell';
            	dropTargetBefore = (
            		<Droppable
     		            types={[dropTargetType]}
            		    data={columnIndex}
        		        onDrop={this.handleMoveDropBefore}>
     		            <div className="drop-before" ><Icon
     			            className='icon-button header-drop-target'
     			            title='<- Move Colum Drop'
     			            name='bullseye'
     			        /></div>
                     </Droppable>
            	)
            	dropTargetAfter = (
            		<Droppable
     		            types={[dropTargetType]}
            		    data={columnIndex}
 		                onDrop={this.handleMoveDropAfter}>
            		    <div className="drop-after" ><Icon
     			            className='icon-button header-drop-target'
     			            title='Move Column Drop ->'
     			            name='bullseye'
     			        /></div>
                     </Droppable>
            	)
            }
            cellValue = (
            	<div >
            		<span className='header-value'>
	                    {columnName}
	                </span>
	                <Label size='mini'>
	                    {`(${column["type"]})`}
	                </Label>
		            <div >
                    {
                        this.props.isLoadingPlot &&
                        this.props.dataset && this.props.dataset.isProfiled() &&
                        <PlotHeader
                            column={column}
                            profiledData={this.props.profiledData}
                            isLoadingPlot={this.props.isLoadingPlot}
                        />
                    }
                    </div>
	            </div>
            );
        }
        return (
    		<Draggable 
    		    type="header-cell" 
    			data={columnIndex} 
    		    wrapperComponent={<th></th>} 
            	className={cellCss} 
    		    onClick={this.handleClick}>
		            {dropTargetBefore}
		            {dropTargetAfter}
	                {cellValue}
	                {dropdown}
            </Draggable>
        );
    }
}

HeaderCell.defaultProps = {
    disabled: false,
    isActive: false,
    isUpdating: false
}

export default HeaderCell;
