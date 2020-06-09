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
import { Dropdown } from 'semantic-ui-react'
import { VIZUAL } from '../../../util/Vizual';

/**
 * Dropdown menu for spreadsheet rows. Calls respective spreadsheet methods
 * when menu items are clicked.
 */

class RowDropDown extends React.Component {
    static propTypes = {
        disabled: PropTypes.bool.isRequired,
        rowId: PropTypes.number.isRequired,
        rowIndex: PropTypes.number.isRequired,
        onAction: PropTypes.func.isRequired
    }
    /**
     * Call spreadsheet delete row method.
     */
    deleteRow = () => {
        const { rowId, onAction } = this.props
        onAction(VIZUAL.DELETE_ROW, rowId);
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
        const { rowId, onAction } = this.props
        onAction(VIZUAL.MOVE_ROW, rowId);
    }
    render() {
        // rowId = the unique, global identifier for the row
        // rowIndex = the position of the row in the dataset
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
