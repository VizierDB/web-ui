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

import { DatasetDescriptor } from './Dataset';
import { HATEOASReferences, HATEOAS_WORKFLOW_CANCEL } from '../util/HATEOAS';
import { utc2LocalTime } from '../util/Timestamp';


// -----------------------------------------------------------------------------
// Workflow objects
// -----------------------------------------------------------------------------

/**
 * Descriptor for a workflow version in a branch history. Contains the version
 * number of the workflow, time of creation, type of action that created the
 * workflow, and a short text describing the type of module that was affected
 * by the action.
 */
export class WorkflowDescriptor {
    /**
     * Helper functions to determine the action type that created the workflow
     * version There are four possible action types: CREATE BRANCH, DELETE
     * MODULE, INSERT (or APPEND) MODULE, and REPLACE MODULE.
     */
    actionIsAppend = () => (this.action === 'apd');
    actionIsCreate = () => (this.action === 'cre');
    actionIsDelete = () => (this.action === 'del');
    actionIsInsert = () => (this.action === 'ins');
    actionIsReplace = () => (this.action === 'upd');
    /**
     * Initialize the workflow descriptor from a Json object that contains the
     * serialization of a WorkflowDescriptor returned by the Web API.
     */
    fromJson(json) {
        this.id = json.id;
        this.createdAt = utc2LocalTime(json.createdAt);
        this.action = json.action;
        this.packageId = json.packageId;
        this.commandId = json.commandId;
        return this;
    }
}


/**
 * Handle for curation workflow. Contains information about the workflow itself
 * and the resources (i.e., datasets and charts) in the workflow state.
 *
 * For now the workflow handle also contains a read only flag to indicate whether
 * the workflow can be modified by the user via the web app. This shold be
 * replaced in the future when proper authentication and access control is
 * implemented.
 */
export class WorkflowHandle {
    constructor(engine) {
        this.engine = engine;
    }
    /**
     * Initialize the workflow handle from a Json object containing a
     * WorkflowHandle returned by the Web API.
     */
    fromJson(json) {
        this.id = json.id;
        this.createdAt = utc2LocalTime(json.createdAt);
        this.state = json.state;
        this.readOnly = json.readOnly;
        // Get a dictionary of dataset descriptors for all datasets that occur
        // in the workflow. Datasets are keyed by their unique identifier. Note
        // that the dictionary will contain all datasets that were created by
        // any module in the workflow and not just the datasets in the current
        // workflow state.
        this.datasets = {};
        for (let i = 0; i < json.datasets.length; i++) {
            const dataset = new DatasetDescriptor().fromJson(json.datasets[i]);
            this.datasets[dataset.id] = dataset;
        }
        // Keep list of modules as they are. The notebook will convert them into
        // a list of notebook cells when needed.
        this.modules = json.modules;
        this.links = new HATEOASReferences(json.links);
        this.tableOfContents = json.tableOfContents
        return this;
    }

    isRunning() {
        return this.links.has(HATEOAS_WORKFLOW_CANCEL)
    }

    /**
     * Get the specification for a given module command.
     */
    getCommandSpec(cmd) {
        return this.engine.packages.getCommandSpec(cmd.packageId, cmd.commandId);
    }
}
