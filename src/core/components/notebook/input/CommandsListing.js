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
import { Grid, Icon, List, Segment, Header } from 'semantic-ui-react'
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
        onSelect: PropTypes.func.isRequired,
    }
    
    groupBy = (arr, property)  => {
    	  return arr.reduce((cat, x) => {
    	    if (!cat[x[property]]) { cat[x[property]] = []; }
    	    cat[x[property]].push(x);
    	    return cat;
    	  }, {});
    	}

    	
    render() {
        const { apiEngine, onDismiss, onPaste, onSelect} = this.props;
        // Get a list of command types
        const gridColumns = [];
        // Get list of packages. The list is sorted by package name by default.
        const knownCategories = ['data_m','code','data_v','vizualization','default'];
        const columnOrg = {'MIMIR':0,'DATA':1,'R':2,'SAMPLING':1,'SCALA':2,'SQL':2,'MARKDOWN':2,'PLOT':2,'PYTHON':2,'VIZUAL':3};
        const packages = apiEngine.packages.toList();//.sort((c1, c2) => (knownCategories.indexOf(c1.category)-knownCategories.indexOf(c2.category)));
        //const groupedPackages = this.groupBy(packages, 'category');
        const groupedPackages = [[],[],[],[]];
        for (let pckg of packages) {
        	let colIdx = (pckg.name.toUpperCase() in columnOrg) ? columnOrg[pckg.name.toUpperCase()] : 1;
        	groupedPackages[colIdx].push(pckg);
        }
        const sortedKeys = [0,1,2,3]//Object.keys(groupedPackages).sort((c1, c2) => (knownCategories.indexOf(c1)-knownCategories.indexOf(c2)))
        //groupedPackages[knownCategories[i]]
        let listItems = [];
        for (const packageCategory of sortedKeys) {
        	listItems = [];
        	const catPackages = groupedPackages[packageCategory];
	        for (let pckg of catPackages) {
	            // Get list of package commands. Elements in the list are sorted by
	            // the command name by default.
	            const commands = pckg.toList();
	            listItems.push(
	                <List.Item key={pckg.id}>
	                    <List.Header>{pckg.name.toUpperCase()}</List.Header>
	                </List.Item>
	            );
	            for (let i = 0; i < commands.length; i++) {
	                const cmd = commands[i];
                    let item = cmd.suggest ? <List.Item key={listItems.length} onClick={() => (onSelect(pckg.id, cmd.id))}>
                        <List.Content>
                            <List.Header as='a' className='suggested-action' icon>
                                <Header.Content>
                                    <Icon name={'star'} color={'yellow'}/>
                                    { cmd.name }
                                </Header.Content>
                            </List.Header>
                        </List.Content>
                    </List.Item> : <List.Item key={listItems.length} onClick={() => (onSelect(pckg.id, cmd.id))}>
                        <List.Content>
                            <List.Header as='a'>{'  ' + cmd.name}</List.Header>
                        </List.Content>
                    </List.Item>
                    listItems.push(item)
	            }
	        }
	        gridColumns.push(
                    <Grid.Column className={packageCategory} width={4} key={gridColumns.length}>
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
