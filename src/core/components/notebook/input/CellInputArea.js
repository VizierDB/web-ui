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

import React from 'react';
import PropTypes from 'prop-types';
import ModuleInputForm from './ModuleInputForm';
import CellMenuBar from './CellMenuBar';
import CommandsListing from './listing/CommandsListing';
import { moduleId } from '../../../resources/Project';
import {
    DT_AS_ROW, DT_BOOL, DT_COLUMN_ID, DT_DATASET_ID, DT_DECIMAL, DT_FILE_ID,
    DT_GROUP, DT_INT, DT_ROW_ID, DT_STRING
} from './ModuleSpec';
import {HotKeys} from 'react-hotkeys';

/**
 * The cell input area contains the two main components for editing a notebook
 * cell. The cell menu bar allows selecting the cell module, as well as to
 * execute the module, delete the cell, and create a new branch starting at the
 * module represented by the cell. The cell module form allows to enter module
 * specific parameter values.
 *
 * Since the cell input area contains the form data and the buttons used to
 * submit the module form, this is also the place where we maintain the internal
 * state of the module form.
 */

// -----------------------------------------------------------------------------
//
// Helper Methods
//
// The following methods are primarily used to manage the state of the module
// form. Note that at this point we do not properly support nesting of rows and
// groups inside rows and groups. Once a suitable use case for this arises we
// need to adjust the code below (mainly the DEFAULT_VALUE part).
//
// -----------------------------------------------------------------------------

/**
 * Convert form values for individual command arguments into the format expected
 * by the API. Needs to traverse the command specification recursively for rows
 * and groups.
 */
const ARGUMENT_VALUE_2_REQUEST_DATA = (argument, command, value) => {
    const dt = argument.datatype;
    if (dt === DT_AS_ROW) {
        let values = {};
        for (let i = 0; i < command.arguments.length; i++) {
            const arg = command.arguments[i];
            if (arg.parent === argument.id) {
                values[arg.id] = ARGUMENT_VALUE_2_REQUEST_DATA(
                    arg,
                    command,
                    value.values[arg.id]
                );
            }
        }
        return values;
    } else if (dt === DT_GROUP) {
        let values = [];
        let tuples = value.tuples;
        for (let t = 0; t < tuples.length; t++) {
            const tuple = tuples[t];
            let tupleValues = {};
            for (let i = 0; i < command.arguments.length; i++) {
                const arg = command.arguments[i];
                if (arg.parent === argument.id) {
                    tupleValues[arg.id] = ARGUMENT_VALUE_2_REQUEST_DATA(
                        arg,
                        command,
                        tuple[arg.id]
                    );
                }
            }
            values.push(tupleValues);
        }
        return values;
    } else {
        return value;
    }
}


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
    if(argument.default){ return argument.default }
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
 * Create an object containing default values for each argument in a given
 * command specification. Initialize values from the given module arguments,
 * where possible.
 */
const DEFAULT_VALUES = (command, datasets, moduleArgs) => {
    const values = {};
    for (let i = 0; i < command.arguments.length; i++) {
        const arg = command.arguments[i];
        if (arg.parent == null) {
            const args = moduleArgs[arg.id];
            values[arg.id] = DEFAULT_VALUE(arg, command, datasets, args);
        }
    }
    return values;
}


/**
 * Convert form values into format as expected by the API.
 */
const FORM_VALUES_2_REQUEST_DATA = (command, values) => {
    const result = {};
    for (let i = 0; i < command.arguments.length; i++) {
        const arg = command.arguments[i];
        if (arg.parent == null) {
            const f_val = values[arg.id];
            if (arg.datatype === DT_COLUMN_ID) {
                if ((f_val !== '')  || (arg.required)) {
                    result[arg.id] = ARGUMENT_VALUE_2_REQUEST_DATA(arg, command, f_val);
                }
            } else {
                result[arg.id] = ARGUMENT_VALUE_2_REQUEST_DATA(arg, command, f_val);
            }
        }
    }
    return result;
}


/**
 * Return true if one of the children of a grouped argument is of type columnid.
 */
const HAS_COLUMNID_CHILDREN = (argument, command) => {
    for (let i = 0; i < command.arguments.length; i++) {
        const arg = command.arguments[i];
        if (arg.parent === argument.id) {
            if (arg.datatype === DT_COLUMN_ID) {
                return true;
            } else if ((arg.datatype === DT_AS_ROW) || (arg.datatype === DT_GROUP)) {
                if (HAS_COLUMNID_CHILDREN(arg, command)) {
                    return true;
                }
            }
        }
    }
    return false;
}


/**
 * Reset the value of a command argument if it is a column id. Otherwise, return
 * the current value. Recursively go through rows and groups.
 */
const RESET_COLUMN_VALUE = (argument, command, value) => {
    const dt = argument.datatype;
    if (dt === DT_AS_ROW) {
        let values = {};
        for (let i = 0; i < command.arguments.length; i++) {
            const arg = command.arguments[i];
            if (arg.parent === argument.id) {
                values[arg.id] = RESET_COLUMN_VALUE(arg, command, value.values[arg.id]);
            }
        }
        return {values};
    } else if (dt === DT_GROUP) {
        let values = {};
        for (let i = 0; i < command.arguments.length; i++) {
            const arg = command.arguments[i];
            if (arg.parent === argument.id) {
                values[arg.id] = RESET_COLUMN_VALUE(arg, command, value.values[arg.id]);
            }
        }
        // If the group has children of type column id we remove all existing
        // tuples. Otherwise, we keep them
        let tuples = null;
        if (HAS_COLUMNID_CHILDREN(argument, command)) {
            tuples = [];
        } else {
            tuples = value.tuples;
        }
        return {tuples, values};
    } else if (dt === DT_COLUMN_ID) {
        return '';
    } else {
        return value;
    }
}


/**
 * Reset all selected column values in case the selected dataset changes..
 */
const RESET_COLUMN_VALUES = (command, values) => {
    const result = {};
    for (let i = 0; i < command.arguments.length; i++) {
        const arg = command.arguments[i];
        if (arg.parent == null) {
            result[arg.id] = RESET_COLUMN_VALUE(arg, command, values[arg.id]);
        }
    }
    return result;
}


/**
 * Validate a single argument in a module command specification.
 */
const VALIDATE_ARGUMENT = (argument, command, value, name) => {
    if ((value === null) && (argument.required)) {
        return ['Missing value for ' + name];
    } else if ((value !== null) && (argument.datatype === DT_FILE_ID)) {
        // For source file arguments there needs to be a filename/file or
        // url combination.
        const { file, fileid, filename, url } = value;
        if ((file != null) && (filename != null)) {
        } else if ((fileid != null) && (filename != null)) {
        } else if (url != null) {
        } else {
            return ['No file selected for ' + name];
        }
    } else if (value !== null) {
        // Check if we can trim the value
        if (value.trim) {
            value = value.trim()
        }
        if ((value === '') && (argument.required)) {
            return ['Missing value for ' + name];
        }
        const dt = argument.datatype;
        if ((dt === DT_INT) || (dt === DT_ROW_ID)) {
            if (isNaN(value)) {
                return ['Expected integer value for ' + name];
            }
        } else if (dt === DT_DECIMAL) {
            if (isNaN(value)) {
                return ['Expected decimal value for ' + name];
            }
        } else if (dt === DT_AS_ROW) {
            let messages = [];
            for (let i = 0; i < command.arguments.length; i++) {
                const arg = command.arguments[i];
                if (arg.parent === argument.id) {
                    VALIDATE_ARGUMENT(
                        arg,
                        command,
                        value.values[arg.id],
                        name + '.'+ arg.name
                    ).forEach((msg) => (messages.push(msg)));
                }
            }
            return messages;
        } else if (dt === DT_GROUP) {
            const tuples = value.tuples;
            if ((tuples.length === 0) && (argument.required)) {
                return ['Missing value(s) for ' + name];
            }
            let messages = [];
            for (let i = 0; i < command.arguments.length; i++) {
                const arg = command.arguments[i];
                if (arg.parent === argument.id) {
                    for (let j = 0; j < tuples.length; j++) {
                        VALIDATE_ARGUMENT(
                            arg,
                            command,
                            tuples[j][arg.id],
                            name + '.'+ arg.name
                        ).forEach((msg) => (messages.push(msg)));
                    }
                }
            }
            return messages;
        }
    }
    return [];
}


/**
 * Validate the current form values against the selected commands. Returns a
 * list of error messages, containing one message per command argument that has
 * and invalid or missing value. If the list is empty the form values are valid.
 */
const VALIDATE_FORM = (command, values) => {
    const errors = [];
    for (let i = 0; i < command.arguments.length; i++) {
        const arg = command.arguments[i];
        if (arg.parent == null) {
            VALIDATE_ARGUMENT(arg, command, values[arg.id], arg.name).forEach(
                (msg) => (errors.push(msg))
            );
        }
    }
    return errors;
}


// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

/**
 * Input area for workflow modules. If no module specification (command) is
 * selected a command listing is shown. Otherwise, the content contains the
 * cell menu bar and the module input form.
 */
class CellInputArea extends React.Component {
    static propTypes = {
        datasets: PropTypes.array.isRequired,
        env: PropTypes.object.isRequired,
        module: PropTypes.object,
        codeEditorProps: PropTypes.object.isRequired,
        onCreateBranch: PropTypes.func,
        onDeleteModule: PropTypes.func,
        onSubmit: PropTypes.func.isRequired
    }
    constructor(props) {
        super(props);
        const { datasets, env, module } = props;
        // The selected command and form values depend on whether the cell is
        // empty or not.
        // form values
        let formValues = {};
        let hasError = false;
        let selectedCommand = null;
        if (module != null) {
            selectedCommand = env.modules.module[moduleId(module.command)];
            formValues = DEFAULT_VALUES(
                selectedCommand,
                datasets,
                module.arguments
            );
            hasError = (module.stderr.length > 0);
        }
        this.state = {
            hasError: hasError,
            errors: null,
            formValues: formValues,
            selectedCommand: selectedCommand
        }
    }
    /**
     * Dismiss a form error message.
     */
    dismissErrors = () => (this.setState({hasError: false, errors: null}));
    /**
     * Change form values in internal state when the user selects a new module
     * for the cell.
     */
    handleModuleSelect = (command) => {
        const { datasets, module } = this.props;
        let modArgs = {};
        if (module != null) {
            if (moduleId(module.command) === moduleId(command)) {
                modArgs = module.arguments;
            }
        }
        this.setState({
            hasError: false,
            errors: null,
            selectedCommand: command,
            formValues: DEFAULT_VALUES(command, datasets, modArgs)
        });
    }
    /**
     * Submit the form by ...
     */
    handleFormSubmit = () => {
        const { onSubmit } = this.props;
        const { formValues, selectedCommand } = this.state;
        // Validate the current input values. The result is a list of error
        // messages, one for each command argument that has an invalid or
        // missing value.
        const errors = VALIDATE_FORM(selectedCommand, formValues);
        if (errors.length > 0) {
            this.setState({hasError: true, errors});
        } else{
            onSubmit(
                selectedCommand,
                FORM_VALUES_2_REQUEST_DATA(selectedCommand, formValues)
            );
        }
    }
    render() {
        const {
            datasets,
            env,
            module,
            codeEditorProps,
            onCreateBranch,
            onDeleteModule
        } = this.props
        const { hasError, errors, formValues, selectedCommand } = this.state
        let content = null;
        if (selectedCommand !== null) {

        	const keyMap = {
        	    runCell: 'ctrl+enter',
        	}

        	const handlers = {
        	  'runCell': (event) => this.handleFormSubmit()
        	};

        	content = (
        			<HotKeys keyMap={keyMap} handlers={handlers}>
	        			<div>
	                    <CellMenuBar
	                        env={env}
	                        module={module}
	                        selectedCommand={selectedCommand}
	                        onCreateBranch={onCreateBranch}
	                        onDeleteModule={onDeleteModule}
	                        onSelect={this.handleModuleSelect}
	                        onSubmit={this.handleFormSubmit}
	                    />
	                    <ModuleInputForm
	                        datasets={datasets}
	                        env={env}
	                        errors={errors}
	                        hasError={hasError}
	                        selectedCommand={selectedCommand}
	                        values={formValues}
	                        codeEditorProps={codeEditorProps}
	                    	onChange={this.setFormValue}
	                        onDismissErrors={this.dismissErrors}
	                        onSubmit={this.handleFormSubmit}
	                    />
	                </div>
                </HotKeys>
            );
        } else {
            content = (
                <CommandsListing
                    env={env}
                    onSelect={this.handleModuleSelect}
                />
            );
        }
        return content
    }
    /**
     * Set the value of a form control in the local state.
     */
    setFormValue = (name, value) => {
        const { formValues, selectedCommand } = this.state;
        const arg = selectedCommand.arguments.find((arg) => (arg.id === name));
        let values = {...formValues};
        if (arg.datatype === DT_FILE_ID) {
            const { filename, url, file } = value;
            values[name] = {fileid: null, filename, url, file};
        } else {
            values[name] = value;
        }
        // If the modified argument is a dataset selector we need to reset all
        // selected column values.
        if (arg.datatype === DT_DATASET_ID) {
            values = RESET_COLUMN_VALUES(selectedCommand, values);
        }
        this.setState({formValues: values});
    }
}

export default CellInputArea;
