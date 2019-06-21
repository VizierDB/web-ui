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
// import { CONTENT_CHART, CONTENT_DATASET, CONTENT_ERROR } from './Outputs';

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
    constructor(id, name, links, branches) {
        this.id = id;
        this.name = name;
        this.links = links;
        this.branches = branches;
    }
    /**
     * Add a new branch to the list of project branches. Returns a new project
     * handle for the modified project.
     */
    addBranch(branch) {
        const modifiedBranchList = [branch];
        for (let i = 0; i < this.branches.length; i++) {
            modifiedBranchList.push(this.branches[i]);
        }
        sortByName(modifiedBranchList);
        return new ProjectHandle(
            this.id,
            this.name,
            this.links,
            modifiedBranchList
        );
    }
    /**
     * Delete the branch with the given identifier. Returns a modified project
     * handle.
     */
    deleteBranch(branchId) {
        const modifiedBranchList = [];
        for (let i = 0; i < this.branches.length; i++) {
            const br = this.branches[i];
            if (br.id !== branchId) {
                modifiedBranchList.push(br);
            }
        }
        return new ProjectHandle(
            this.id,
            this.name,
            this.links,
            modifiedBranchList
        );
    }
    /**
     * Shortcut to retrieve branch with the given identifier.
     */
    findBranch(branchId) {
        if (branchId != null) {
            return this.branches.find((br) => (br.id === branchId));
        }
    }
    /**
     * Initialize the object properties from a Json object that is returned by
     * Web API calls that return a ProjectHandle.
     */
    fromJson(json) {
        this.id = json.id;
        this.name = getProperty(json, 'name');
        this.links = new HATEOASReferences(json.links);
        // List of project branchs (sorted by name)
        this.branches = [];
        for (let i = 0; i < json.branches.length; i++) {
            this.branches.push(new BranchDescriptor().fromJson(json.branches[i]));
        }
        sortByName(this.branches);
        return this;
    }
    /**
     * Returns the default branch for this project.
     */
    getDefaultBranch() {
        return this.branches.find((br) => (br.isDefault));
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
        const { id, name, links, branches } = this;
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
        return new ProjectHandle(id, name, links, modBranches);
    }
    /**
     * Create a copy of the project handle with a modified name.
     */
    updateName(name) {
        const { id, links, branches } = this;
        return new ProjectHandle(id, name, links, branches);
    }
}



// -----------------------------------------------------------------------------
// Functions
// -----------------------------------------------------------------------------

/**
 * Use the combination of module type and type-dependent module identifier as
 * a unique module identifier. Module is a command specification returned by
 * the Web API.
 */
export const moduleId = (module) => (module.type + ':' + module.id)
