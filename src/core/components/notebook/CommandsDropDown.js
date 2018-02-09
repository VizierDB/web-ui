import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown } from 'semantic-ui-react'
import { moduleIdentifier } from '../../util/Api'
import '../../../css/Notebook.css'


class CommandsDropDown extends React.Component {
    static propTypes = {
        notebookCellComponent: PropTypes.object.isRequired,
        env: PropTypes.object.isRequired,
        selectedModule: PropTypes.object
    }
    handleSelect = (e, data) => {
        const { notebookCellComponent, env } = this.props
        notebookCellComponent.selectModule(env.module[data.value])
    }
    render() {
        const { env, selectedModule } = this.props
        // Get a list of command types
        const menuItems = []
        for (let value of env.types) {
            menuItems.push(
                <Dropdown.Header key={menuItems.length} content={value} />
            )
            const typeCommands = env.modules[value]
            typeCommands.sort((c1, c2) => (c1.name.localeCompare(c2.name)))
            for (let i = 0; i < typeCommands.length; i++) {
                const cmd = typeCommands[i]
                menuItems.push(
                    <Dropdown.Item
                        key={menuItems.length}
                        content={cmd.name}
                        value={moduleIdentifier(cmd)}
                        onClick={this.handleSelect}
                    />
                )
            }
        }
        // Depending on whether a command is selected or not a different icon
        // and label are being shown
        let label = null
        if (selectedModule) {
            label = selectedModule.name
        } else {
            label = 'Select Module Type'
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
                    text={label}
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
