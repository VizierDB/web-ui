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
import RowDropDown from '../menu/RowDropDown';
import '../../../../css/Spreadsheet.css';
import { Droppable } from 'react-drag-and-drop'
import { Icon } from 'semantic-ui-react';
import {
    VIZUAL
} from '../../../util/Vizual';

/**
 * Left-hand column in the grid that contains the row index and context menu.
 */
class RowIndexCell extends React.Component {
    static propTypes = {
        disabled: PropTypes.bool.isRequired,
        rowIndex: PropTypes.number.isRequired,
        rowId: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([
             PropTypes.string,
             PropTypes.number
         ]),
         onAction: PropTypes.func,
         onClick: PropTypes.func,
         onMoveAction: PropTypes.func,
         isSpreadsheet: PropTypes.bool
    }
    
    handleMoveDropBefore = (dropData, dropTargetData) => {
        const { onMoveAction } = this.props;
        const dropTargetDataValue = dropTargetData.currentTarget.attributes.data.value;
        onMoveAction(VIZUAL.MOVE_ROW,  parseInt(dropData['row-index-cell'], 10),  parseInt(dropTargetDataValue, 10));
    }
    handleMoveDropAfter = (dropData, dropTargetData) => {
        const { onMoveAction } = this.props;
        const dropTargetDataValue = dropTargetData.currentTarget.attributes.data.value;
        onMoveAction(VIZUAL.MOVE_ROW,  parseInt(dropData['row-index-cell'], 10),  parseInt(dropTargetDataValue, 10));
    }
    /**
     * Render grod column as Html table header cell.
     */
    render() {
        const { disabled, rowIndex, rowId, value, onAction, onClick, isSpreadsheet } = this.props;
        // Show a dropdown menu if onAction method is provided
        let dropdown = null;
        let dropTargetType = 'none';
        let dropTargetBefore = null;
        let dropTargetAfter = null;
        
        if (onAction != null) {
            dropdown = (
                <RowDropDown
                    disabled={disabled}
                    key={rowId}
                    rowId={rowId}
                    rowIndex={rowIndex}
                    onAction={onAction}
                />
            );
        }
        if ((rowIndex !== -1) && (isSpreadsheet)){
        	dropTargetType = 'row-index-cell';
        	dropTargetBefore = (
        		<Droppable
 		            types={[dropTargetType]}
        		    data={rowIndex}
        		    onDrop={this.handleMoveDropBefore}>
 		            <div className="row-drop-before" ><Icon
 			            className='icon-button row-index-drop-target'
 			            title='<- Move Row Drop'
 			            name='bullseye'
 			        /></div>
                 </Droppable>
        	)
        	dropTargetAfter = (
        		<Droppable
 		            types={[dropTargetType]}
        		    data={rowIndex}
    		        onDrop={this.handleMoveDropAfter}>
 		            <div className="row-drop-after" ><Icon
 			            className='icon-button row-index-drop-target'
 			            title='Move Row Drop ->'
 			            name='bullseye'
 			        /></div>
                 </Droppable>
        	)
        }
        return (
            <td className='grid-row-index' onClick={onClick}>
              <div >
                {dropTargetBefore}
	            <div className="row-index-content" >
		            { value }
	            </div>
                { dropdown }
                {dropTargetAfter}
              </div>
            </td>
        );
    }
}

RowIndexCell.defaultProps = {
    disabled: false,
    rowIndex: -1
}


export default RowIndexCell;
