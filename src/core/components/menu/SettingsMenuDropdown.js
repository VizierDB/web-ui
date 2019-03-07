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
 * Dropdown menu for the global user preferences. The menu allow the user to
 * reverse the order of notebook cells and to define the filter for shown/
 * hidden notebook cells (based on the package and command).
 */

class SettingsMenuDropdown extends React.Component {
    static propTypes = {
        onHideCells: PropTypes.func.isRequired,
        onReverse: PropTypes.func.isRequired,
        userSettings: PropTypes.object.isRequired
    }
    render() {
        const { onHideCells, onReverse, userSettings } = this.props;
        return (
            <Dropdown item text='Settings'>
                <Dropdown.Menu>
                    <Dropdown.Header key='head1' content='Notebook cells in ...' />
                    <Dropdown.Item
                        disabled={!userSettings.showNotebookReversed()}
                        key='defaultOrder'
                        icon='sort numeric ascending'
                        text='Default order'
                        title='List notebook cells in default order (first cell shown first)'
                        onClick={onReverse}
                    />
                    <Dropdown.Item
                        key='reverseOrder'
                        disabled={userSettings.showNotebookReversed()}
                        icon='sort numeric descending'
                        text='Reverse order'
                        title='List notebook cells in reverse order (last cell shown first)'
                        onClick={onReverse}
                    />
                    <Dropdown.Divider key='div1' />
                    <Dropdown.Header key='head2' content='Show / Hide Cells' />
                    <Dropdown.Item
                        disabled={true}
                        key='filter'
                        icon='filter'
                        text='Filter ...'
                        title={'Filter cells by the type of their command'}
                    />
                    <Dropdown.Divider key='div2' />
                    <Dropdown.Item
                        disabled={!userSettings.hideFilteredCommands()}
                        key='collapse'
                        icon='compress'
                        text='Collapse'
                        title='Collapse cells that contain filtered commands'
                        onClick={onHideCells}
                    />
                    <Dropdown.Item
                        disabled={userSettings.hideFilteredCommands()}
                        key='hide'
                        icon='hide'
                        text='Hide'
                        title='Hide cells that contain filtered commands'
                        onClick={onHideCells}
                    />
                </Dropdown.Menu>
            </Dropdown>
        );
    }
}

export default SettingsMenuDropdown;
