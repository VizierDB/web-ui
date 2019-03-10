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
import { Button, Header, Icon, Segment } from 'semantic-ui-react';
import CommandMenu from './CommandMenu';
import CommandsListing from './CommandsListing';
import '../../../../css/ModuleForm.css';


/**
 * The moule input area is divided into three parts: (i) a header that contains
 * a dropdown menu to select one of the available module commands, (2) the
 * command input form, and (3) buttons to sumbit or dismiss the module changes.
 */
class ModuleInputArea extends React.Component {
    static propTypes = {
        apiEngine: PropTypes.object.isRequired,
        datasets: PropTypes.array.isRequired,
        cell: PropTypes.object.isRequired,
        onDismiss: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
        userSettings: PropTypes.object.isRequired
    }
    constructor(props) {
        super(props);
        const cell = props.cell;
        this.state = {selectedCommand: cell.commandSpec}
    }
    /**
     * Dismiss changes to the cell when the user presses the Dismiss button.
     */
    handleDismiss = () => {
        const { cell, onDismiss } = this.props;
        onDismiss(cell);
    }
    /**
     * Set the command in the user settings clipboard as the selected command.
     */
    handlePasteCommand = () => {
        const { userSettings } = this.props;
        this.setState({selectedCommand: userSettings.clipboard.commandSpec});
    }
    /**
     * Update the selected command to the command that is identified by the
     * given pair of package and command identifier.
     */
    handleSelectCommand = (packageId, commandId) => {
        const { apiEngine, onDismiss, onSubmit } = this.props;
        const cmd = apiEngine.packages.getCommandSpec(packageId, commandId);
        this.setState({selectedCommand: cmd});
    }
    render() {
        const { apiEngine, onDismiss, onSubmit, userSettings } = this.props;
        const { selectedCommand } = this.state;
        // The main content depends on whether a command has been selected or
        // not. If no command is selected a simple message is shown the alert
        // the user to the command dropdown menu.
        let mainContent = null
        if (selectedCommand == null) {
            mainContent = (
                <div>
                    <CommandsListing apiEngine={apiEngine} onSelect={this.handleSelectCommand} />
                    <div className='module-form-buttons'>
                        <Button negative onClick={this.handleDismiss}>Dismiss</Button>
                        <Button disabled positive onClick={onSubmit}>Submit</Button>
                    </div>
                </div>
            );
            /*    <div className='module-form-empty'>
                    <Header icon>
                      <Icon name='wrench' />
                          Start by selecting a command from the menu.
                    </Header>
                </div>
            );*/
        } else {
            mainContent = (
                <div className='module-form-buttons'>
                    <Button negative onClick={this.handleDismiss}>Dismiss</Button>
                    <Button positive onClick={onSubmit}>Submit</Button>
                </div>
            );
        }
        // The onPaste function is only set if the user settings clipboard is
        // defined
        let onPaste = null;
        if (userSettings.clipboard != null) {
            onPaste = this.handlePasteCommand;
        }
        return (
            <div>
                <CommandMenu
                    apiEngine={apiEngine}
                    onPaste={onPaste}
                    onSelect={this.handleSelectCommand}
                    selectedCommand={selectedCommand}
                />
                <Segment attached='bottom'>
                    { mainContent }
                </Segment>
            </div>
        );
    }
}

export default ModuleInputArea;
