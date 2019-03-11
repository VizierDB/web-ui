/**
 * Copyright (C) 2018-2019 New York University
 *                         University at Buffalo,
 *                         Illinois Institute of Technology.
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
import { Dropdown, Icon, Menu } from 'semantic-ui-react';

/**
 * Display a menu containing all available commands.
 */
class CommandMenu extends React.Component {
    static propTypes = {
        apiEngine: PropTypes.object.isRequired,
        selectedCommand: PropTypes.object,
        onPaste: PropTypes.func,
        onSelect: PropTypes.func.isRequired
    }
    render() {
        const { apiEngine, onPaste, onSelect, selectedCommand } = this.props;
        // Add one item per package. For packages that contain multiple commands
        // a nested menu item is shown. If a package contains only a single
        // command do not show a nested menu. Use the single command as the
        // menu item instead.
        let selectedCmd = null;
        let selectedPckg = null;
        if (selectedCommand != null) {
            selectedCmd = selectedCommand.id
            selectedPckg = selectedCommand.packageId;
        }
        const menuItems = [];
        for (let i = 0; i < apiEngine.packages.packageList.length; i++) {
            const pckg = apiEngine.packages.packageList[i];
            const commands = pckg.commands;
            let item = null;
            if (commands.length > 1) {
                const dropdownItems = [];
                for (let c = 0; c < pckg.commands.length; c++) {
                    const cmd = pckg.commands[c];
                    dropdownItems.push(
                        <Dropdown.Item
                            key={cmd.id}
                            disabled={(pckg.id === selectedPckg) && (cmd.id === selectedCmd)}
                            onClick={() => (onSelect(pckg.id, cmd.id))}
                        >
                            {cmd.name}
                        </Dropdown.Item>
                    );
                }
                item = (
                    <Dropdown.Item key={pckg.id}>
                        <Icon name='dropdown' />
                        <span className='text'>{pckg.name.toUpperCase()}</span>
                        <Dropdown.Menu>
                            { dropdownItems }
                        </Dropdown.Menu>
                    </Dropdown.Item>
                );
            } else {
                const cmd = commands[0];
                item = (
                    <Dropdown.Item
                        key={pckg.id}
                        disabled={(pckg.id === selectedPckg)}
                        onClick={() => (onSelect(pckg.id, cmd.id))}
                    >
                        {cmd.name}
                    </Dropdown.Item>);
            }
            menuItems.push(item);
        }
        // Display the name of the selected command (if not null)
        let menuHeader = 'Select Command';
        if (selectedCommand != null) {
            menuHeader = selectedCommand.name;
        }
        // Add paste item to menu if the onPaste callback is given.
        if (onPaste != null) {
            menuItems.push(<Dropdown.Divider key='__divider__'/>);
            menuItems.push(
                <Dropdown.Item
                    key={'__paste__'}
                    icon='paste'
                    text='Paste'
                    title='Paste command from clipboard'
                    onClick={onPaste}
                />
            );
        }
        return (
            <Menu>
                <Dropdown item text={menuHeader} simple>
                    <Dropdown.Menu>
                        {menuItems}
                    </Dropdown.Menu>
                </Dropdown>
            </Menu>
        );
    }
}

export default CommandMenu;
