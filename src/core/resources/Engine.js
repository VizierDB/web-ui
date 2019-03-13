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


/**
 * Constants for supported datatypes of command parameters in the command
 * specifications that are included in the module registry that is obtained
 * from the API..
 */

export const DT_BOOL = 'bool';
export const DT_CODE = 'code';
export const DT_COLUMN_ID = 'colid';
export const DT_DATASET_ID = 'dataset';
export const DT_DECIMAL = 'decimal';
export const DT_FILE_ID = 'fileid';
export const DT_INT = 'int';
export const DT_LIST = 'list';
export const DT_RECORD = 'record';
export const DT_ROW_INDEX = 'rowidx';
export const DT_ROW_ID = 'rowid';
export const DT_SCALAR = 'scalar';
export const DT_STRING = 'string';



/**
 * The module registry contains a list of all packages. Each package contains
 * a list of all commands in the package. The registry also maintains a package
 * index that enables access to a package by its identifier.
 */
export class ModuleRegistry {
    fromJson(json) {
        this.packageList = [];
        this.packageIndex = {};
        for (let i = 0; i < json.length; i++) {
            const obj = json[i];
            this.packageIndex[obj.id] = new PackageModule().fromJson(obj);
            const commands = obj.commands;
            sortByName(commands)
            this.packageList.push({
                id: obj.id,
                name: obj.name,
                commands: commands
            });
        }
        return this;
    }
    /**
     * Get the specification for a given command.
     */
    getCommandSpec(packageId, commandId) {
        return this.packageIndex[packageId].commands[commandId];
    }
}


/**
 * Command declaration in a package of workflow commands.
 */
class PackageModule {
    fromJson(json) {
        this.id = json.id;
        this.name = json.name;
        this.commands = {};
        for (let i = 0; i < json.commands.length; i++) {
            const obj = json.commands[i];
            obj.packageId = json.id;
            obj.parameters.sort((a, b) => (a.index - b.index));
            this.commands[obj.id] = obj;
        }
        return this;
    }
}


// -----------------------------------------------------------------------------
// Helper Methods
// -----------------------------------------------------------------------------

/**
 * Convert form values for the gien command specification into a format that is
 * expected by the API. Returns an object that contains the request and a
 * potentially empty list of error messages for form values that failed to
 * validate.
 */
export const formValuesToRequestData = (commandSpec, values, parent) => {
    const result = {data: {}, errors: []};
    for (let i = 0; i < commandSpec.parameters.length; i++) {
        const para = commandSpec.parameters[i];
        if ((para.parent === parent) || ((para.parent == null) && (parent == null))) {
            const val = values[para.id];
            if (para.datatype === DT_RECORD) {
                if (val != null) {
                    const recordResult = formValuesToRequestData(commandSpec, val, para.id);
                    result.data[para.id] = recordResult.data;
                    recordResult.errors.forEach((err) => (result.errors.push(err)))
                } else if (para.required) {
                    result.errors.push('Missing value for ' + para.name);
                }
            } else if (para.datatype === DT_LIST) {
                if ((val != null) && (val.length > 0)) {
                    for (let r = 0; r < val.length; r++) {
                        const rowResult = formValuesToRequestData(
                            commandSpec,
                            val[r],
                            para.id
                        );
                        result.data[para.id] = rowResult.data;
                        rowResult.errors.forEach((err) => (result.errors.push(err)))
                    }
                } else if (para.required) {
                    result.errors.push('Missing value for ' + para.name);
                }
            } else {
                validateArgument(para, val, para.name, result.errors);
                result.data[para.id] = val;
            }
        }
    }
    return result;
}


/**
 * To test if a coomand specification is a code command we look for a parameter
 * that is of type DT_CODE. If such a parameter exists it will have a language
 * property that further specifies the type of cell.
 */
export const getCodeParameter = (commandSpec) => (
    commandSpec.parameters.find((p) => (p.datatype === DT_CODE))
);


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
}


/**
 * Set the values of all column identifier arguments to null. This reset is
 * necessary when the user selects a new top-level dataset in the command input
 * form.
 */
export const resetColumnIds = (values, commandSpec, parent) => {
    for (let i = 0; i < commandSpec.parameters.length; i++) {
        const para = commandSpec.parameters[i];
        if ((para.parent === parent) || ((para.parent == null) && (parent == null))) {
            if (para.datatype === DT_COLUMN_ID) {
                values[para.id] = null;
            } else if (para.datatype === DT_RECORD) {
                resetColumnIds(values[para.id], commandSpec, para.id );
            } else if (para.datatype === DT_LIST) {
                for (let r = 0; r < values[para.id].length; r++) {
                    resetColumnIds(values[para.id][r], commandSpec, para.id );
                }
            }
        }
    }
}


/**
 * Create an object containing default values for each parameter in a given
 * command specification. Initialize values from the given module arguments,
 * where possible.
 */
export const toFormValues = (commandSpec, datasets, moduleArgs, parent) => {
    const values = {};
    for (let i = 0; i < commandSpec.parameters.length; i++) {
        const para = commandSpec.parameters[i];
        if ((para.parent === parent) || ((para.parent == null) && (parent == null))) {
            const arg = (moduleArgs != null) ? moduleArgs.find((a) => (a.id === para.id)) : null;
            let val = null;
            if (para.datatype === DT_RECORD) {
                // Get a list of parameter specifications for the children of
                // the given record.
                const recordVal = (arg != null) ? arg.value : [];
                val = toFormValues(commandSpec, datasets, recordVal, para.id);
            } else if (para.datatype === DT_LIST) {
                // The argument value is a list of lists (one for each record
                // in the list)
                val = [];
                if (arg != null) {
                    for (let rec = 0; rec < arg.value.length; rec++) {
                        val.push(
                            toFormValues(
                                commandSpec,
                                datasets,
                                arg.value[rec],
                                para.id
                            )
                        );
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
    }
    return values;
}


/**
 * Validate a single argument in a module command specification. Append all
 * error messages to a given list.
 */
const validateArgument = (paraSpec, value, name, errors) => {
    if ((value === null) && (paraSpec.required)) {
        errors.push('Missing value for ' + name);
    } else if ((value !== null) && (paraSpec.datatype === DT_FILE_ID)) {
        // For source file arguments there needs to be a filename/file or
        // url combination.
        const { file, fileid, filename, url } = value;
        if ((file != null) && (filename != null)) {
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
