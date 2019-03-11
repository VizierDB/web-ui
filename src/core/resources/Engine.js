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

export const DT_CODE = 'code';
export const DT_RECORD = 'record';
export const DT_LIST = 'list';


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
            this.commands[obj.id] = obj;
        }
        return this;
    }
}
