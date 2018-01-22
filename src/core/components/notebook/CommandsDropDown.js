import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown } from 'semantic-ui-react'
import { moduleIdentifier } from '../../util/Api'
import '../../../css/Notebook.css'


class CommandsDropDown extends React.Component {
    static propTypes = {
        cell: PropTypes.object.isRequired,
        engine: PropTypes.object.isRequired,
        selectedModule: PropTypes.object
    }
    handleSelect = (e, data) => {
        const { cell, engine } = this.props
        cell.selectModule(engine.module[data.value])
    }
    render() {
        const { engine, selectedModule } = this.props
        // Get a list of command types
        const menuItems = []
        for (let value of engine.types) {
            menuItems.push(
                <Dropdown.Header key={menuItems.length} content={value} />
            )
            const typeCommands = engine.modules[value]
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
        let icon = null
        let label = null
        if (selectedModule) {
            icon = 'lightning'
            label = selectedModule.name
        } else {
            icon = 'question'
            label = 'Select Module Type'
        }
        return (
            <div className='command-dropdown'>
                <Dropdown floating icon={icon}>
                    <Dropdown.Menu>
                        { menuItems }
                    </Dropdown.Menu>
                </Dropdown>
            <span className='command-type'>{label}</span>
        </div>
        )
    }
}

export default CommandsDropDown
