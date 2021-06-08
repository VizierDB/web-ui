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

/**
 * Helper classes and constants for HATEOAS references returned as part of
 * API responses for the different API resources.
 */

// General
export const HATEOAS_SELF = 'self';

// API
export const HATEOAS_API_DOC = 'api.doc';
export const HATEOAS_USER_AUTH = 'user.auth';

// Branch
export const HATEOAS_BRANCH_HEAD = 'branch.head';
export const HATEOAS_BRANCH_UPDATE_PROPERTY = 'branch.update';

// Dataset
export const HATEOAS_DATASET_DOWNLOAD = 'dataset.download';
export const HATEOAS_DATASET_GET_ANNOTATIONS = 'annotations.get';

// Projects
export const HATEOAS_PROJECTS_CREATE = 'project.create';
export const HATEOAS_PROJECTS_IMPORT = 'project.import';
export const HATEOAS_PROJECTS_DELETE = 'project.delete';
export const HATEOAS_PROJECTS_LIST = 'project.list';
export const HATEOAS_PROJECT_UPDATE_PROPERTY = 'project.update';

// Project
export const HATEOAS_PROJECT_FILE_UPLOAD = 'file.upload';

// Workflow
export const HATEOAS_WORKFLOW_CANCEL = 'workflow.cancel';

// Module
export const HATEOAS_MODULE_APPEND = 'workflow.append';
export const HATEOAS_MODULE_DELETE = 'module.delete';
export const HATEOAS_MODULE_INSERT = 'module.insert';
export const HATEOAS_MODULE_REPLACE = 'module.replace';
export const HATEOAS_MODULE_FREEZE = 'module.freeze';
export const HATEOAS_MODULE_FREEZE_ONE = 'module.freeze_one';
export const HATEOAS_MODULE_THAW = 'module.thaw';
export const HATEOAS_MODULE_THAW_ONE = 'module.thaw_one';


/**
 * Maintain a list of HATEOAS references that are given as an array of
 * (rel,href)-pairs.
 *
 * Provides methods to retrieve references for given relationship keys and
 * to test for the existence of objects with particular reference keys in the
 * array.
 */
export class HATEOASReferences {
    /**
     * Expects an array of HATEOAS reference objects as returned by the API.
     * Each object has a 'rel' and 'href' property.
     */
    constructor(links) {
        this.links = links;
    }
    /**
     * Get the HTTP reference that is associated with the given relationship
     * key. The result is null if no reference with the given key exists.
     */
    get(key) {
        const ref = this.links.find((ref) => (ref.rel === key));
        if (ref != null) {
            return ref.href;
        } else {
            console.log(null())
            console.log('HATEOAS action '+key+' NOT FOUND IN: '+this.links)
            return null;
        }
    }
    /**
     * Get annotations for a dataset cell identified by the column and row
     * identifier.
     */
    getAnnotations(columnId, rowId) {
        let url = this.get(HATEOAS_DATASET_GET_ANNOTATIONS);
        url += '?column=' + columnId + '&row=' + rowId;
        return url;
    }
    /**
     * Get the dataset fetch URL for a given range of rows. This method
     * it is called on the set of URL's returned for a dataset descriptor
     */
    getDatasetUrl(offset, limit, profile=false) {
        let url = this.get(HATEOAS_SELF);
        url += '?offset=' + offset + '&limit=' + limit;
        if(profile){
            url += '&profile=' + profile;
        }
        return url;
    }
    /**
     * Get the Url for a workflow with the given identifier.
     *
     * This method will return null if the links list does not contain an entry
     * for the project listing.
     */
    getNotebookUrl(projectId, branchId, workflowId) {
        let url = this.get(HATEOAS_PROJECTS_LIST);
        if (url != null) {
            url += '/' + projectId + '/branches/' + branchId;
            if (workflowId != null) {
                url += '/workflows/' + workflowId;
            } else {
                url += '/head';
            }
            return url;
        } else {
            return null;
        }
    }
    /**
     * Get the Url for a project with the given identifier. The idea is to keep
     * all resource URLs in one place. At this point we just hard-code the
     * pattern for project URLs into the method. To be more flexible we could
     * include URL patterns in the links object as well.
     *
     * This method will return null if the links list does not contain an entry
     * for the project listing.
     */
    getProjectUrl(projectId) {
        const url = this.get(HATEOAS_PROJECTS_LIST);
        if (url != null) {
            return url + '/' + projectId;
        } else {
            return null;
        }
    }
    /**
     * Short-cut to get resource self reference.
     */
    getSelf = () => (this.get(HATEOAS_SELF));
    /**
     * Test if a HATEOAS reference with the given key exists.
     */
    has(key) {
        return (this.links.find((ref) => (ref.rel === key)) != null);
    }
}
