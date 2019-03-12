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
 * Create an object containing default values for each parameter in a given
 * command specification. Initialize values from the given module arguments,
 * where possible.
 */
export const formValues = (commandSpec, datasets, moduleArgs, parent) => {
    const values = {};
    for (let i = 0; i < commandSpec.parameters.length; i++) {
        const para = commandSpec.parameters[i];
        if (para.parent == parent) {
            const arg = (moduleArgs != null) ? moduleArgs.find((a) => (a.id === para.id)) : null;
            let val = null;
            if (para.datatype === DT_RECORD) {
                // Get a list of parameter specifications for the children of
                // the given record.
                const recordVal = (arg != null) ? arg.value : [];
                val = formValues(commandSpec, datasets, recordVal, para.id);
            } else if (para.datatype === DT_LIST) {
                // The argument value is a list of lists (one for each record
                // in the list)
                val = [];
                if (arg != null) {
                    for (let rec = 0; rec < arg.value.length; rec++) {
                        val.push(
                            formValues(
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
                            const opt = para.values[i];
                            if (opt.isDefault === true) {
                                val = opt.value;
                                break;
                            }
                        }
                    }
                } else {
                    // If the value is still undefined we set it to a defined
                    // default. For some datatypes, howeber, the value remains
                    // null.
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
export const selectedDataset = (commandSpec, values, datasets) => {
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
