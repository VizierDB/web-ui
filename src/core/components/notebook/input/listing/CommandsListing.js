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
     * Submit selected module specification to controlling component.
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
        //max number of items pre col
        const fullCol = 9.5;
        // Further group modules by name
        let curCol = 0.0;
        let listItems = [];
        for (let value of groups) {
            const typeCommands = env.modules.package[value];
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
