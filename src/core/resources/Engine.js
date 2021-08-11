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

/**
 * Set of commands that are supported by the workflow engine which is associated
 * with a curation project. Each command represents a module specification that
 * can be used to define modules in a workflow (-> cells in a notebook). We
 * sometimes refer to a command specification as module.
 *
 * Each command specification belongs to a package and has an indentifier that
 * is unique in the package. In the registry we use the combination of package
 * identifier and command identifier as module (spec.) identifier.
 *
 * The module registry has the following main components:
 *
 * .module: Associative array that provides access to modules by their id.
 * .package: Associative array that provides access to module packages. Each
 *   package in turn is an list of modules in that package.
 * .types: List pf package identifier
 */

import { sortByName } from '../util/Sort';
import {formatBytes} from "../util/App";


/**
 * Constants for supported datatypes of command parameters in the command
 * specifications that are included in the module registry that is obtained
 * from the API..
 */

export const DT_BOOL = 'bool';
export const DT_CODE = 'code';
export const DT_COLUMN_ID = 'colid';
export const DT_DATASET_ID = 'dataset';
export const DT_ARTIFACT_ID = 'artifact';
export const DT_DECIMAL = 'decimal';
export const DT_FILE_ID = 'fileid';
export const DT_INT = 'int';
export const DT_LIST = 'list';
export const DT_RECORD = 'record';
export const DT_ROW_INDEX = 'rowidx';
export const DT_ROW_ID = 'rowid';
export const DT_SCALAR = 'scalar';
export const DT_STRING = 'string';
export const DT_URL = 'url'

/**
 * Declaration of a command in a workflow package. The command maintains a
 * nested list of parameter declarations based on the defined parent-child
 * relationships in the parameter list.
 *
 * The command declaration also maintains a reference to a top-level parameter
 * of type DT_CODE (if it exist). We currently assume that there is at most
 * one code parameter for a command declaration.
 */
class CommandDeclaration {
    constructor(packageId) {
        this.packageId = packageId;
    }
    fromJson(obj) {
        this.id = obj.id;
        this.name = obj.name;
        this.description = obj.description;
        this.suggest = obj.suggest;
        // Sort parameters by identifier to ensure that they will be rendered
        // in the correct order. Then convert the flat list of parameters
        // into a nested list based on parent-child relationships
        obj.parameters.sort((a, b) => (a.index - b.index));
        this.parameters = nestCommandParameters(obj.parameters);
        // Set the code parameter property for faster access when rendering
        // notebook cells
        this.codeParameter = this.parameters.find((p) => (p.datatype === DT_CODE));
        // Do the same for the file id property
        this.fileParameter = this.parameters.find((p) => (p.datatype === DT_FILE_ID));
        return this;
    }
}


/**
 * The package declaration contains the declarations for all commands in a
 * package of workflow modules.
 */
class PackageDeclaration {
    fromJson(json) {
        this.id = json.id;
        this.name = json.name;
        this.category = json.category;
        // Maintain a list of all commands sorted by their name
        this.elements = [];
        this.commands = {};
        for (let i = 0; i < json.commands.length; i++) {
            const cmd = new CommandDeclaration(json.id).fromJson(json.commands[i]);
            this.commands[cmd.id] = cmd;
            this.elements.push(cmd);
        }
        // Sort the command listing by name
        sortByName(this.elements);
        return this;
    }
    /**
     * Get a listing of all commands in the package.
     */
    toList() {
        return this.elements;
    }
}


/**
 * The package registry contains a list of all packages. Each package contains
 * a list of all commands in the package. The registry also maintains a package
 * index that enables access to a package by its identifier.
 */
export class PackageRegistry {
    fromJson(json) {
        // Maintain a list of all packages
        this.elements = [];
        // Maintain an index of packages where packages are accessible by their
        // identifier
        this.packages = {};
        for (let i = 0; i < json.length; i++) {
            const pckg = new PackageDeclaration().fromJson(json[i]);
            this.packages[pckg.id] = pckg;
            this.elements.push(pckg);
        }
        // Sort package list by package name
        sortByName(this.elements);
        return this;
    }
    /**
     * Get the specification for a given command.
     */
    getCommandSpec(packageId, commandId) {
    	if(packageId && commandId){
            return this.packages[packageId].commands[commandId];
    	}
    	else return {name:'Create'}
    }
    /**
     * Get a listing of package declarations in the registry.
     */
    toList() {
        return this.elements;
    }
}


// -----------------------------------------------------------------------------
// Helper Methods
// -----------------------------------------------------------------------------

/**
 * Convert form values for the gien command specification into a format that is
 * expected by the API.
 *
 * The API expects a list of arguments that are id-value pairs. For rows and
 * lists the argument value may be nested.
 *
 * Returns an object that contains the request and a
 * potentially empty list of error messages for form values that failed to
 * validate.
 */
export const formValuesToRequestData = (values, parameters, serviceProperties) => {
    const result = {data: [], errors: []};
    for (let i = 0; i < parameters.length; i++) {
        const para = parameters[i];
        let val = values[para.id];
        if (para.datatype === DT_RECORD) {
            if (val != null) {
                const recordResult = formValuesToRequestData(
                    val,
                    para.parameters
                );
                result.data.push({id: para.id, value: recordResult.data});
                recordResult.errors.forEach((err) => (result.errors.push(err)))
            } else if (para.required) {
                result.errors.push('Missing value for ' + para.name);
            }
        } else if (para.datatype === DT_LIST) {
            if ((val != null) && (val.length > 0)) {
                const rows = [];
                for (let r = 0; r < val.length; r++) {
                    const rowResult = formValuesToRequestData(
                        val[r],
                        para.parameters
                    );
                    rows.push(rowResult.data);
                    rowResult.errors.forEach((err) => (result.errors.push(err)))
                }
                result.data.push({id: para.id, value: rows});
            } else if (para.required) {
                result.errors.push('Missing value for ' + para.name);
            }
        } else {
            const dt = para.datatype;
            if ((dt === DT_INT)) {
                val = parseInt(val, 10);
            } else if (dt === DT_DECIMAL) {
                val = parseFloat(val);
            }
            validateArgument(val, para, result.errors, serviceProperties);
            result.data.push({id: para.id, value: val});
        }
    }
    return result;
}


/**
 * Returns the selected dataset if the command specification has a top-level
 * argument of type 'dataset' and the value in the module form for this
 * argument is set.
 */
export const getSelectedDataset = (commandSpec, values, datasets) => {
    // If values is undefined we can return immediately
    if (values == null) {
        return null;
    }
    for (let i = 0; i < commandSpec.parameters.length; i++) {
        const arg = commandSpec.parameters[i];
        if (arg.datatype === DT_DATASET_ID) {
            const val = values[arg.id];
            if (val != null) {
                for (let j = 0; j < datasets.length; j++) {
                    const ds = datasets[j];
                    if (ds.name === val) {
                        return ds;
                    }
                }
            }
        }
    }
    return null;
}


/**
 * Create a nested object of command parameters based on parent-child
 * relationships of parameters in a command declaration.
 */
const nestCommandParameters = (parameters, parent) => {
    const result = [];
    for (let i = 0; i < parameters.length; i++) {
        const para = parameters[i];
        if ((para.parent === parent) || ((para.parent == null) && (parent == null))) {
            if ((para.datatype === DT_RECORD) || (para.datatype === DT_LIST)) {
                // Add nested parameters property for records and lists
                para.parameters = nestCommandParameters(parameters, para.id);
            }
            result.push(para);
        }
    }
    return result;
}


/**
 * Set the values of all column identifier arguments to null. This reset is
 * necessary when the user selects a new top-level dataset in the command input
 * form.
 */
export const resetColumnIds = (values, parameterSpecs) => {
    for (let i = 0; i < parameterSpecs.length; i++) {
        const para = parameterSpecs[i];
        if (para.datatype === DT_COLUMN_ID) {
            values[para.id] = null;
        } else if (para.datatype === DT_RECORD) {
            resetColumnIds(values[para.id], para.parameters);
        } else if (para.datatype === DT_LIST) {
            const rows = values[para.id];
            for (let r = 0; r < rows.length; r++) {
                resetColumnIds(rows[r], para.parameters);
            }
        }
    }
}


/**
 * Create an object containing default values for each parameter in a given
 * command specification. Initialize values from the given module arguments,
 * where possible.
 */
export const toFormValues = (parameters, datasets, moduleArgs) => {
    const values = {};
    for (let i = 0; i < parameters.length; i++) {
        const para = parameters[i];
        const arg = (moduleArgs != null) ? moduleArgs.find((a) => (a.id === para.id)) : null;
        let val = null;
        if (para.datatype === DT_RECORD) {
            // Get a list of parameter specifications for the children of
            // the given record.
            const recordVal = (arg != null) ? arg.value : [];
            val = toFormValues(para.parameters, datasets, recordVal);
        } else if (para.datatype === DT_LIST) {
            // The argument value is a list of lists (one for each record
            // in the list)
            val = [];
            if (arg != null) {
                for (let r = 0; r < arg.value.length; r++) {
                    val.push(toFormValues(para.parameters, datasets, arg.value[r]));
                }
            }
        } else {
            // Get the value for the parameter. We first try to get the
            // value from the respective element in the module arguments
            // array. If the argument does not exist we try to get a default
            // value from the optional values enumeration in the command
            // specification.
            if (arg != null) {
                val = arg.value;
            } else if (para.values != null) {
                // By default the first value in the list is used as the
                // default value.
                val = para.values[0].value;
                if (para.values[0].isDefault !== true) {
                    for (let j = 1; j < para.values.length; j++) {
                        const opt = para.values[j];
                        if (opt.isDefault === true) {
                            val = opt.value;
                            break;
                        }
                    }
                }
            } else if (para.defaultValue != null) {
                // A parameter may have an optional default value specified
                val = para.defaultValue;
            } else {
                // If the value is still undefined we set it to a defined
                // default.
                if (para.datatype === DT_BOOL) {
                    val = false;
                } else if (para.datatype === DT_DATASET_ID) {
                    val = (datasets.length > 0) ? datasets[0].name : '';
                } else if (para.datatype === DT_FILE_ID) {
                    val = {fileid: null, filename: null, url: null};
                }
            }
        }
        values[para.id] = val;
    }
    return values;
}


/**
 * Validate a single argument in a module command specification. Append all
 * error messages to a given list.
 */
const validateArgument = (value, paraSpec, errors, serviceProperties) => {
    const name = paraSpec.name;
    if ((value === null) && (paraSpec.required)) {
        errors.push('Missing value for ' + name);
    } else if ((value !== null) && (paraSpec.datatype === DT_FILE_ID)) {
        // For source file arguments there needs to be a filename/file or
        // url combination.
        const { file, fileid, filename, url } = value;
        if ((file != null) && (filename != null)) {
            if(file["size"]>serviceProperties.maxFileSize){
                errors.push('Filesize exceeds maximum limit: ' + formatBytes(serviceProperties.maxFileSize, 2))
            }
        } else if ((fileid != null) && (filename != null)) {
        } else if (url != null) {
        } else {
            errors.push('No file selected for ' + name);
        }
    } else if (value != null) {
        if ((value === '') && (paraSpec.required)) {
            errors.push('Missing value for ' + name);
        } else {
            const dt = paraSpec.datatype;
            if ((dt === DT_INT) || (dt === DT_ROW_ID)) {
                if (isNaN(value)) {
                    errors.push('Expected integer value for ' + name);
                }
            } else if (dt === DT_DECIMAL) {
                if (isNaN(value)) {
                    errors.push('Expected decimal value for ' + name);
                }
            }
        }
    }
}
