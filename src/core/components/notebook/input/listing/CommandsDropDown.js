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
import { moduleId } from '../../../../resources/Project'
import '../../../../../css/Notebook.css'


/**
 * Display a dropdown with all available modules.
 */
class CommandsDropDown extends React.Component {
    static propTypes = {
        env: PropTypes.object.isRequired,
        selectedCommand: PropTypes.object.isRequired,
        onSelect: PropTypes.func.isRequired
    }
    handleSelect = (e, data) => {
        const { env, onSelect } = this.props
        onSelect(env.modules.module[data.value])
    }
    render() {
        const { env, selectedCommand } = this.props
        const selectedId = moduleId(selectedCommand);
        // Get a list of command types
        const menuItems = []
        for (let value of env.modules.types) {
            menuItems.push(
                <Dropdown.Header key={menuItems.length} content={value} />
            )
            const typeCommands = env.modules.package[value]
            typeCommands.sort((c1, c2) => (c1.name.localeCompare(c2.name)))
            for (let i = 0; i < typeCommands.length; i++) {
                const cmd = typeCommands[i];
                const value = moduleId(cmd);
                menuItems.push(
                    <Dropdown.Item
                        key={menuItems.length}
                        content={cmd.name}
                        value={value}
                        disabled={value === selectedId}
                        onClick={this.handleSelect}
                    />
                )
            }
        }
        return (
            <span className='command-dropdown'>
                <Dropdown
                    button
                    className='icon'
                    floating
                    labeled
                    icon='list'
                    scrolling
                    text={selectedCommand.name}
                >
                    <Dropdown.Menu>
                        { menuItems }
                    </Dropdown.Menu>
                </Dropdown>
        </span>
        )
    }
}

export default CommandsDropDown
