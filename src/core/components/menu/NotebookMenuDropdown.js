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

import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';

/**
 * Dropdown menu for a notebook. The menu allow the user to reverse the order
 * of notebook cells and to switch the group mode for VizUAL cells.
 */

class NotebookMenuDropdown extends React.Component {
    static propTypes = {
        groupMode: PropTypes.number.isRequired,
        onChangeGrouping: PropTypes.func.isRequired,
        onReverse: PropTypes.func.isRequired
    }
    /**
     * Handle click on a 'Change grouping' menu item.
     */
    handleChangeGrouping = (e, { value }) => {
        const { onChangeGrouping } = this.props;
        onChangeGrouping(value);
    }
    render() {
        const { groupMode, onReverse } = this.props;
        return (
            <Dropdown item text='Notebook'>
                <Dropdown.Menu>
                    <Dropdown.Header content='Notebook Cells' />
                    <Dropdown.Item
                        key='reverse'
                        icon='sort'
                        text='Reverse Order'
                        onClick={onReverse}
                    />
                    <Dropdown.Divider />
                    <Dropdown.Header content='VizUAL Commands' />
                    <Dropdown.Item
                        key='show'
                        icon='eye'
                        text='Show'
                        disabled={groupMode === 'GRP_SHOW'}
                        value={'GRP_SHOW'}
                        onClick={this.handleChangeGrouping}
                    />
                    <Dropdown.Item
                        key='collapse'
                        icon='compress'
                        text='Collapse'
                        disabled={groupMode === 'GRP_COLLAPSE'}
                        value={'GRP_COLLAPSE'}
                        onClick={this.handleChangeGrouping}
                    />
                    <Dropdown.Item
                        key='hide'
                        icon='hide'
                        text='Hide'
                        disabled={groupMode === 'GRP_HIDE'}
                        value={'GRP_HIDE'}
                        onClick={this.handleChangeGrouping}
                    />
                </Dropdown.Menu>
            </Dropdown>
        );
    }
}

export default NotebookMenuDropdown;
