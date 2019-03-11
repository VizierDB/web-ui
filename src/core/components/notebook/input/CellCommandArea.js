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
import { HotKeys } from 'react-hotkeys';
import { Button, Header, Icon, Form, Segment } from 'semantic-ui-react';
import CommandMenu from './CommandMenu';
import CommandsListing from './CommandsListing';
import CodeCell from './form/CodeCell'
import { DT_CODE, DT_LIST, DT_RECORD } from '../../../resources/Engine';
import '../../../../css/App.css';
import '../../../../css/ModuleForm.css';

import {
    DT_AS_ROW, DT_BOOL, DT_COLUMN_ID, DT_DATASET_ID, DT_DECIMAL, DT_FILE_ID,
    DT_GROUP, DT_INT, DT_ROW_ID, DT_STRING
} from './ModuleSpec';


/**
 * Get default value for an argument in a command specification. The given
 * argValue variable contains values in the corresponding values in the module
 * arguments from the workflow (if they exist). The value may be undefined.
 *
 * The supported argument data types and their respective default values are:
 *
 * asRow: {child1, chiild2, ...}
 * bool: false
 * colid: ''
 * datasetid: ID of first dataset in list or ''
 * decimal:''
 * fileid: ID of first file in list or ''
 * group: {tuples: [], values: {child1, chiild2, ...}}
 * int: ''
 * pyCode: ''
 * rowid: ''
 * string: ''
 */
const DEFAULT_VALUE = (argument, command, datasets, argValue) => {
    const dt = argument.datatype;
    // Test for a structured argument data type first.
    if (dt === DT_AS_ROW) {
        let values = {};
        for (let i = 0; i < command.arguments.length; i++) {
            const arg = command.arguments[i];
            if (arg.parent === argument.id) {
                let val;
                if (argValue !== undefined) {
                    val = argValue[arg.id];
                }
                values[arg.id] = DEFAULT_VALUE(arg, command, datasets, val);
            }
        }
        return {values};
    } else if (dt === DT_GROUP) {
        let values = {};
        for (let i = 0; i < command.arguments.length; i++) {
            const arg = command.arguments[i];
            if (arg.parent === argument.id) {
                values[arg.id] = DEFAULT_VALUE(arg, command, datasets);
            }
        }
        let tuples = argValue;
        // Ensure that tuples is at least an empty array and not undefined or
        // null.
        if (tuples == null) {
            tuples = [];
        }
        return {tuples, values};
    } else if (argValue !== undefined) {
        // The argument contains a scalar value. Return any given value if it is
        // not undefined
        return argValue;
    } else if (dt === DT_BOOL) {
        return false;
    } else if (dt === DT_DATASET_ID) {
        return datasets.length > 0 ? datasets[0].name : '';
    } else if (dt === DT_FILE_ID) {
        return {fileid: null, filename: null, url: null};
    } else if ((dt === DT_STRING) && (argument.values)) {
        for (let i = 0; i < argument.values.length; i++) {
            const entry = argument.values[i];
            // Check whether the entry is a structured value or a string
            if (typeof entry === 'object') {
                // If the entry has .isDefault set to true return the entry key
                // or value (depending on whether there is a key or not; the
                // value property os expected to be present in all cases).
                if (entry.isDefault === true) {
                    if (entry.key) {
                        return entry.key;
                    } else {
                        return entry.value;
                    }
                }
            }
        }
    }
    // Make sure to keep this return statement outside the if-else because the
    // DT_STRING and values block may not return a value.
    return '';
}


/**
 * Create an object containing default values for each parameter in a given
 * command specification. Initialize values from the given module arguments,
 * where possible.
 */
const formValues = (commandSpec, datasets, moduleArgs) => {
    const values = {};
    for (let i = 0; i < commandSpec.parameters.length; i++) {
        const para = commandSpec.parameters[i];
        if (DT_RECORD) {

        } else if (DT_LIST) {

        } else if (para.parent == null) {
            // Get the value for the parameter. We first try to get the value
            // from the respective element in the module arguments array. If
            // the argument does not exist we try to get a default value from
            // the optional values enumeration in the command specification.
            let val = null;
            if (moduleArgs != null) {
                const arg = moduleArgs.find((a) => (a.id === para.id));
                if (arg != null) {
                    val = arg.value;
                }
            }
            if (para.values != null) {
                // By default the first value in the list is used as the default
                // value.
                val = para.values[0].value;
                if (para.values[0].isDefault !== true) {
                    for (let j = 1; j < para.values.length; j++) {
                        const opt = para.values[i];
                        if (opt.isDefault === true) {
                            val = opt.value;
                            break;
                        }
                    }
                }
            }
            values[para.id] = val;
        }
    }
    return values;
}


/**
 * The moule input area is divided into three parts: (i) a header that contains
 * a dropdown menu to select one of the available module commands, (2) the
 * command input form, and (3) buttons to sumbit or dismiss the module changes.
 */
class CellCommandArea extends React.Component {
    static propTypes = {
        apiEngine: PropTypes.object.isRequired,
        datasets: PropTypes.array.isRequired,
        cell: PropTypes.object.isRequired,
        isActiveCell: PropTypes.bool.isRequired,
        onClick: PropTypes.func.isRequired,
        onDismiss: PropTypes.func.isRequired,
        onDoubleClick: PropTypes.func,
        onSelectCell: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
        userSettings: PropTypes.object.isRequired
    }
    constructor(props) {
        super(props);
        const { cell, datasets } = props;
        // Keep track of the command specification that is currently being
        // selected. For an existing cell the specification initially is the one
        // that is contained in the workflow module handle. For new cells the
        // command specification is undefined or null. If the user selects a
        // new command from the command menu the local state will be updated
        // accordingly.
        // If the cell contains a code editor maintain information about the
        // cursor position and a list of new lines that are being pasted from
        // a code-snippet selector
        let values = null;
        if (!cell.isNewCell()) {
            values = formValues(cell.commandSpec, datasets, cell.module.command.arguments);
        }
        this.state = {
            codeEditorProps: {
                cursorPosition: { line: 0, ch: 0 },
                newLines: ""
            },
            formValues: values,
            selectedCommand: cell.commandSpec,
            showCommandsListing: (cell.commandSpec == null)
        }
    }
    /**
     * Handle cell expand event for code editor change.
     */
    handleCodeEditorChange = (id, value, cursorPosition) => {
    	//const { cell, isActiveCell, onSelectCell } = this.props;
        // Use the onEdit callback to set the cell in edit mode if it currently
        // is not in edit mode.
        console.log('Change ' + id)
        console.log(value)
        console.log(cursorPosition)
    	//window.activeCodeCell = cell.id;
    	/*this.setState({
            codeEditorProps: {
                cursorPosition: cursorPosition,
                newLines: value
            }
        });*/
    }
    /**
     * If the cell is being selected (e.g., a contained code cell received the
     * cursor) we need to set this cell as the active notebook cell.
     */
    handleSelectCell = () => {
        const { cell, isActiveCell, onSelectCell } = this.props;
        if (!isActiveCell) {
            onSelectCell(cell);
        }
    }
    /**
     * Dismiss changes to the cell when the user presses the Dismiss button.
     */
    handleDismiss = () => {
        const { cell, onDismiss } = this.props;
        if (!cell.isNewCell()) {
            this.setState({selectedCommand: cell.commandSpec});
        }
        onDismiss(cell);
    }
    handleFormSubmit = () => {
        const { onSubmit } = this.props;
        onSubmit();
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
        this.setState({selectedCommand: cmd, showCommandsListing: (cmd == null)});
    }
    /**
     * Set the showCommandsListing to true to show a list of available commands.
     */
    handleSchowCommandsListing = () => {
        this.setState({showCommandsListing: true});
    }
    render() {
        const {
            apiEngine,
            cell,
            isActiveCell,
            onClick,
            onDismiss,
            onDoubleClick,
            onSelectCell,
            onSubmit,
            userSettings
        } = this.props;
        const {
            formValues,
            selectedCommand,
            showCommandsListing
        } = this.state;
        // The main content depends on whether a command specification is
        // defined for the associated notebook cell or not.
        let mainContent = null;
        if ((isActiveCell) && ((selectedCommand == null) || (showCommandsListing))) {
            let onPaste = null;
            if (userSettings.clipboard != null) {
                onPaste = this.handlePasteCommand;
            }
            // If the command specification is undefined or the show command listing
            // flag is true then a listing of all available commands is shown to allow
            // the user to select a command.
            mainContent = (
                <CommandsListing
                    apiEngine={apiEngine}
                    onSelect={this.handleSelectCommand} />
            );
        } else {
            // Use hotkeys to submit and dismiss a shown command input form.
            const keyMap = {
                runCell: 'ctrl+enter',
                dismiss: 'esc'
            }
            const handlers = {
              'runCell': this.handleFormSubmit,
              'dismiss': this.handleDismiss
            };
            // If there is a command specification defined for this component
            // the output depends on whether (i) the command is a code cell
            // command and (2) the cell is in edit state or not.
            let paraCode = null;
            if (isActiveCell) {
                paraCode = getCodeParameter(selectedCommand);
            } else if (!cell.isNewCell()) {
                paraCode = getCodeParameter(cell.commandSpec);
            }
            if (paraCode != null) {
                const { codeEditorProps } = this.state;
                let codeCell = null;
                if (paraCode.language === 'python') {
                    console.log(formValues);
                    codeCell = (
                        <CodeCell
                            key={paraCode.id}
                            id={paraCode.id}
                            value={formValues[paraCode.id]}
                            editing={false}
                            cursorPosition={codeEditorProps.cursorPosition}
                            onChange={this.handleCodeEditorChange}
                            onSelectCell={this.handleSelectCell}
                        />
                    );
                }
                mainContent = (
                    <HotKeys keyMap={keyMap} handlers={handlers}>
                        <Form>{codeCell}</Form>
                    </HotKeys>
                );
            } else if (isActiveCell) {

            } else if ((cell.isNewCell())  && (selectedCommand != null)) {
                mainContent = (
                    <pre
                        className={'cell-cmd-text'}
                        onClick={onClick}
                        onDoubleClick={onDoubleClick}
                    >
                        {selectedCommand.name}
                    </pre>
                );
            } else if (cell.module != null) {
                // If the cell is not a code cell, it is not being edited, and
                // it is not a new cell then the cell has to have an associated
                // workflow module. In this case we show the command text.
                mainContent = (
                    <pre
                        className={'cell-cmd-text'}
                        onClick={onClick}
                        onDoubleClick={onDoubleClick}
                    >
                        {cell.module.text}
                    </pre>
                );
            }
        }
        // Add a list of action buttons if the cell is the active cell.
        let buttons = null;
        if ((isActiveCell) && (!showCommandsListing)) {
            buttons = (
                <div className='module-form-buttons'>
                    <Button
                        content='Change Command'
                        icon='wrench'
                        labelPosition='left'
                        onClick={this.handleSchowCommandsListing}
                    />
                    <Button
                        content='Submit'
                        icon='paper plane outline'
                        labelPosition='left'
                        positive
                        onClick={this.handleFormSubmit}
                    />
                    <Button
                        content='Dismiss'
                        icon='close'
                        labelPosition='left'
                        negative
                        onClick={this.handleDismiss}
                    />
                </div>
            );
        }
        return (
            <div>
                { mainContent }
                { buttons }
            </div>
        );
    }
}

// -----------------------------------------------------------------------------
// Helper Methods
// -----------------------------------------------------------------------------

/**
 * To test if a coomand specification is a code command we look for a parameter
 * that is of type DT_CODE. If such a parameter exists it will have a language
 * property that further specifies the type of cell.
 */
const getCodeParameter = (commandSpec) => (
    commandSpec.parameters.find((p) => (p.datatype === DT_CODE))
);


export default CellCommandArea;
