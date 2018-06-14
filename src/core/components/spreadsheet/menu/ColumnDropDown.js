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
import { SORT, VIZUAL } from '../../../util/Vizual';

/**
 * Dropdown menu for spreadsheet columns. Calls respective spreadsheet methods
 * when menu items are clicked.
 */

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
                    <Dropdown.Divider />
                    <Dropdown.Item
                        icon='sort alphabet down'
                        content='Sort A-Z'
                        onClick={this.sortAZ}
                    />
                    <Dropdown.Item
                        icon='sort alphabet up'
                        content='Sort Z-A'
                        onClick={this.sortZA}
                    />
                </Dropdown.Menu>
            </Dropdown>
        );
    }
    /**
     * Sort spreadsheet based on column values in ascending order
     */
    sortAZ = () => {
        const { columnId, onAction } = this.props
        onAction(VIZUAL.SORT, columnId, SORT.ASC);
    }
    /**
     * Sort spreadsheet based on column values in descending order
     */
    sortZA = () => {
        const { columnId, onAction } = this.props
        onAction(VIZUAL.SORT, columnId, SORT.DESC);
    }
}

export default ColumnDropDown;
