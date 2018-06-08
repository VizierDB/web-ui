import React from 'react'
import PropTypes from 'prop-types'
import { Grid, List } from 'semantic-ui-react'
import { moduleId } from '../../../../resources/Project'
import '../../../../../css/Commands.css'


/**
 * Display a listing of all available module specifications (commands) as user
 * can chose from in a new notebook cell.
 */
class CommandsListing extends React.Component {
    static propTypes = {
        env: PropTypes.object.isRequired,
        onSelect: PropTypes.func.isRequired
    }
    /**
     * Submit selected modulespecification to controlling component.
     */
    handleClick = (e, data) => {
        const { env, onSelect } = this.props;
        onSelect(env.modules.module[data.value]);
    }
    render() {
        const { env } = this.props;
        // Get a list of command types
        const gridColumns = [];
        // Sort he list of module group identifier.
        const groups = Array.from(env.modules.types);
        groups.sort();
        // Further group modules by name
        let list_index = '';
        let listItems = [];
        for (let value of groups) {
            const typeCommands = env.modules.package[value];
            typeCommands.sort((c1, c2) => (c1.name.localeCompare(c2.name)));
            if (value.charAt(0) !== list_index) {
                if (listItems.length > 0) {
                    gridColumns.push(
                        <Grid.Column width={4} key={gridColumns.length}>
                            <List link>
                                { listItems }
                            </List>
                        </Grid.Column>
                    );
                    listItems = [];
                }
                list_index = value.charAt(0);
            }
            listItems.push(
                <List.Item key={value}>
                    <List.Header>{value.toUpperCase()}</List.Header>
                </List.Item>
            );
            for (let i = 0; i < typeCommands.length; i++) {
                const cmd = typeCommands[i]
                listItems.push(
                    <List.Item
                        key={listItems.length}
                        value={moduleId(cmd)}
                        onClick={this.handleClick}
                    >
                        <List.Content>
                            <List.Header as='a'>{cmd.name}</List.Header>
                        </List.Content>
                    </List.Item>
                )
            }
        }
        if (listItems.length > 0) {
            gridColumns.push(
                <Grid.Column width={4} key={gridColumns.length}>
                    <List link>
                        { listItems }
                    </List>
                </Grid.Column>
            );
        }
        return (
            <div className='commands-listing'>
                <p className='commands-listing-header'>
                    Select a module from the list below.
                </p>
                <Grid columns={env.modules.types.length} divided>
                    <Grid.Row>
                        { gridColumns }
                    </Grid.Row>
                </Grid>
            </div>
        )
    }
}

export default CommandsListing;
