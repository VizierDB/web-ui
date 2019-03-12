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
import { sortByName } from '../../../util/Sort';
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
        // Sort the list of module group identifier.
        const groups = apiEngine.packages.packageList;
        sortByName(groups);
        //max number of items pre col
        const fullCol = 9.5;
        // Further group modules by name
        let curCol = 0.0;
        let listItems = [];
        for (let value of groups) {
            const typeCommands = value.commands;
            //add 1.25 for group and 1.0 for each command
            curCol += 1.25 + typeCommands.length;
            typeCommands.sort((c1, c2) => (c1.name.localeCompare(c2.name)));
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
                    curCol = 1.25 + typeCommands.length;
                }

            }
            listItems.push(
                <List.Item key={value.id}>
                    <List.Header>{value.name.toUpperCase()}</List.Header>
                </List.Item>
            );
            for (let i = 0; i < typeCommands.length; i++) {
                const cmd = typeCommands[i]
                listItems.push(
                    <List.Item
                        key={listItems.length}
                        onClick={() => (onSelect(value.id, cmd.id))}
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
                    <Grid columns={groups.length} divided>
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
