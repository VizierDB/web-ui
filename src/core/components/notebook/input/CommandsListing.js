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
import { Grid, Icon, List, Segment } from 'semantic-ui-react'
import '../../../../css/Commands.css'


/**
 * Display a listing of all available module specifications (commands) as user
 * can chose from in a new notebook cell.
 */
class CommandsListing extends React.Component {
    static propTypes = {
        apiEngine: PropTypes.object.isRequired,
        onDismiss: PropTypes.func.isRequired,
        onPaste: PropTypes.func,
        onSelect: PropTypes.func.isRequired
    }
    render() {
        const { apiEngine, onDismiss, onPaste, onSelect } = this.props;
        // Get a list of command types
        const gridColumns = [];
        // Get list of packages. The list is sorted by package name by default.
        const packages = apiEngine.packages.toList().sort((c1, c2) => (c2.name.localeCompare(c1.name)));
        //max number of items pre col
        const fullCol = 7.5;
        // Further group modules by name
        let curCol = 0.0;
        let listItems = [];
        for (let pckg of packages) {
            // Get list of package commands. Elements in the list are sorted by
            // the command name by default.
            const commands = pckg.toList();
            // add 1.25 for package and 1.0 for each command
            curCol += 1.25 + commands.length;
            if (curCol >= fullCol) {
                if (listItems.length > 0) {
                    gridColumns.push(
                        <Grid.Column width={4} key={gridColumns.length}>
                            <List link>
                                { listItems }
                            </List>
                        </Grid.Column>
                    );
                    listItems = [];
                    curCol = 1.25 + commands.length;
                }

            }
            listItems.push(
                <List.Item key={pckg.id}>
                    <List.Header>{pckg.name.toUpperCase()}</List.Header>
                </List.Item>
            );
            for (let i = 0; i < commands.length; i++) {
                const cmd = commands[i]
                listItems.push(
                    <List.Item
                        key={listItems.length}
                        onClick={() => (onSelect(pckg.id, cmd.id))}
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
        // Show a paste command button in the title if the onPaste callback is
        // given.
        let title = null;
        if (onPaste != null) {
            title = (
                <div>
                    {'Select a module from the list below or paste '}
                    <Icon
                        name='paste'
                        link
                        onClick={onPaste}
                        title='Paste from clipboard'
                    />
                    {'from clipboard.'}
                </div>
            );
        } else {
            title = 'Select a module from the list below.'
        }
        return (
            <div className='commands-listing'>
                <Segment>
                    <div className='commands-listing-header'>
                        { title }
                        <span className='pull-right clickable-icon'>
                            <Icon
                                name='close'
                                link
                                onClick={onDismiss}
                            />
                        </span>
                    </div>
                    <Grid columns={packages.length} divided>
                        <Grid.Row>
                            { gridColumns }
                        </Grid.Row>
                    </Grid>
                </Segment>
            </div>
        )
    }
}

export default CommandsListing;
