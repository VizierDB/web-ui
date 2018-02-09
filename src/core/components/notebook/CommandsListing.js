import React from 'react'
import PropTypes from 'prop-types'
import { Grid, List } from 'semantic-ui-react'
import { moduleIdentifier } from '../../util/Api'
import '../../../css/Notebook.css'


class CommandsListing extends React.Component {
    static propTypes = {
        notebookCellComponent: PropTypes.object.isRequired,
        env: PropTypes.object.isRequired
    }
    handleClick = (e, data) => {
        const { notebookCellComponent, env } = this.props
        notebookCellComponent.selectModule(env.module[data.value])
    }
    render() {
        const { env } = this.props
        // Get a list of command types
        const gridColumns = []
        for (let value of env.types) {
            const typeCommands = env.modules[value]
            typeCommands.sort((c1, c2) => (c1.name.localeCompare(c2.name)))
            let listItems = []
            for (let i = 0; i < typeCommands.length; i++) {
                const cmd = typeCommands[i]
                listItems.push(
                    <List.Item
                        key={listItems.length}
                        value={moduleIdentifier(cmd)}
                        onClick={this.handleClick}
                    >
                        <List.Content>
                            <List.Header as='a'>{cmd.name}</List.Header>
                        </List.Content>
                    </List.Item>
                )
            }
            gridColumns.push(
                <Grid.Column width={4} key={gridColumns.length}>
                    <List link>
                        <List.Item>
                            <List.Header>{value.toUpperCase()}</List.Header>
                        </List.Item>
                        { listItems }
                    </List>
                </Grid.Column>
            )
        }
        return (
            <div className='commands-listing'>
                <p className='empty-cell-message'>
                    Select a module from the list below.
                </p>
                <Grid columns={env.types.length} divided>
                    <Grid.Row>
                        { gridColumns }
                    </Grid.Row>
                </Grid>
            </div>
        )
    }
}

export default CommandsListing
