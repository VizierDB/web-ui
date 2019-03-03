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

import { BranchDescriptor } from './Branch';
import { getProperty } from '../util/Api';
import { HATEOASReferences } from '../util/HATEOAS';
import { sortByName } from '../util/Sort';
import { utc2LocalTime } from '../util/Timestamp';
import { VIZUAL, VIZUAL_OP } from '../util/Vizual';


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
            this.commands[obj.id] = obj;
        }
        return this;
    }
}

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
class ModuleRegistry {
    fromJson(json) {
        for (let i = 0; i < json.length; i++) {
            const obj = json[i];
            this[obj.id] = new PackageModule().fromJson(obj);
        }
        return this;
    }
}


/**
 * Descriptor for a project in the project listing. Contains the information
 * that is required by the project listing component.
 */
export class ProjectDescriptor {
    fromJson(json) {
        this.id = json.id;
        this.name = getProperty(json, 'name', 'undefined');
        this.createdAt = utc2LocalTime(json.createdAt);
        this.lastModifiedAt = utc2LocalTime(json.lastModifiedAt);
        this.defaultBranch = json.defaultBranch;
        this.links = new HATEOASReferences(json.links);
        return this;
    }
}


/**
 * Metadata for a vizier data curation project (i.e., a VizTrail). Contains the
 * project id, name, links and list of descriptors for project branches.
 *
 * The project currently also contains the registry of available modules for
 * workflows and the listing of files on the file server (for display in module
* forms, e.g., LOAD DATASET). At least e latter is supposed to change in the
* future.
 */
export class ProjectHandle {
    constructor(id, name, links, packages, branches) {
        this.id = id;
        this.name = name;
        this.links = links;
        this.packages = packages;
        this.branches = branches;
    }
    /**
     * Initialize the object properties from a Json object that is returned by
     * Web API calls that return a ProjectHandle.
     */
    fromJson(json) {
        this.id = json.id;
        this.name = getProperty(json, 'name');
        this.links = new HATEOASReferences(json.links);
        // The module registry contains the list of commands that are supported
        // for the project. Commands are grouped by the package they belong to.
        this.packages = new ModuleRegistry().fromJson(json.packages);
        // List of project branchs (sorted by name)
        this.branches = [];
        for (let i = 0; i < json.branches.length; i++) {
            this.branches.push(new BranchDescriptor().fromJson(json.branches[i]));
        }
        sortByName(this.branches);
        return this;
    }
    /**
     * This method is used to identify cells in a notebook that are grouped.
     * The information about which cells are grouped should be encoded in the
     * project packages.
     * Note: For now, the information is hard-coded.
     */
    isGrouped(module) {
        if (module.command.type === VIZUAL_OP) {
            const cmdId = module.command.id;
            if (
                (cmdId !== VIZUAL.LOAD) &&
                (cmdId !== VIZUAL.DROP_DATASET) &&
                (cmdId !== VIZUAL.RENAME_DATASET) &&
                (cmdId !== VIZUAL.SORT)
            ) {
                return true;
            }
        }
        return false;
    }
    /**
     * Create a copy of the project handle where the branch listing is modified
     * so that it contains the given branch instead of an outdated one.
     */
    updateBranch(branch) {
        const { id, name, links, packages, branches } = this;
        // Create a modified branch listing
        const modBranches = [];
        for (let i = 0; i < branches.length; i++) {
            const br = branches[i];
            if (br.id === branch.id) {
                modBranches.push(branch);
            } else {
                modBranches.push(br);
            }
        }
        return new ProjectHandle(id, name, links, packages, modBranches);
    }
    /**
     * Create a copy of the project handle with a modified name.
     */
    updateName(name) {
        const { id, links, packages, branches } = this;
        return new ProjectHandle(id, name, links, packages, branches);
    }
}


// -----------------------------------------------------------------------------
// Project page resource
// -----------------------------------------------------------------------------

// Resource content types
const CONTENT_CHART = 'CONTENT_CHART';
const CONTENT_DATASET = 'CONTENT_DATASET';
const CONTENT_ERROR = 'CONTENT_ERROR';
const CONTENT_HISTORY = 'CONTENT_HISTORY';
const CONTENT_NOTEBOOK = 'CONTENT_NOTEBOOK';
const CONTENT_DATASET_ERROR = 'CONTENT_DATASET_ERROR';

const RESOURCE_BRANCH = 'RESOURCE_BRANCH';
const RESOURCE_NOTEBOOK = 'RESOURCE_NOTEBOOK';


/**
 * Wrapper for the project resource. The resource captures one of the following
 * content types: Notebook, Branch History, Spreadsheet, Chart view, or Error.
 * The .type property contains the type information while the .content contains
 * the type specific content.
 */
export class ProjectResource {
    /**
     * Constructor expects the content type information and a type-specific
     * content object.
     */
    constructor(resourceType) {
        this.resourceType = resourceType;
    }
    /**
     * Various flags to check the type of the content.
     */
    isBranch = () => (this.resourceType === RESOURCE_BRANCH);
    isNotebook = () => (this.resourceType === RESOURCE_NOTEBOOK);

}


// Shortcuts for different content types
export const BranchResource = () => (new ProjectResource(RESOURCE_BRANCH));
export const NotebookResource = (notebook) => (new ProjectResource(RESOURCE_NOTEBOOK));

export const ChartResource = () => (new ProjectResource(-1));
export const DatasetErrorResource = () => (new ProjectResource(-1));
export const ErrorResource = () => (new ProjectResource(-1));
export const SpreadsheetResource = () => (new ProjectResource(-1));

// -----------------------------------------------------------------------------
// Functions
// -----------------------------------------------------------------------------

/**
 * Use the combination of module type and type-dependent module identifier as
 * a unique module identifier. Module is a command specification returned by
 * the Web API.
 */
export const moduleId = (module) => (module.type + ':' + module.id)
