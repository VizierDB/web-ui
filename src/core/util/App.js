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
 * Set application routes. The baseHref points to the application home. Route
 * projectHref points to the web page for individual projects.
 */
import { CONTENT_CHART, CONTENT_DATASET, CONTENT_ERROR } from '../resources/Outputs';

let href = process.env.PUBLIC_URL;
if (process.env.NODE_ENV === 'production') {
    // href = href + '/vizier-db';
}
if (href === '') {
    href = '/'
}

export const baseHref = href;
export const projectHref = baseHref + 'projects/:project_id';
export const branchHref = projectHref + '/branches/:branch_id';
export const branchHistoryHref = branchHref + '/history';
export const notebookHeadHref = branchHref + '/head';
export const notebookVersionHref = branchHref + '/workflows/:workflow_id';
export const spreadsheetHref = notebookHeadHref + '/spreadsheet/:dataset_id';
export const errorListHref = notebookHeadHref + '/errors/:dataset_id';
export const spreadsheetVersionHref = notebookVersionHref + '/spreadsheet/:dataset_id';
export const errorListVersionHref = notebookVersionHref + '/errors/:dataset_id';

/**
 * Key codes
 */

export const KEY = {
    DOWN: 40,
    ENTER: 13,
    ESC: 27,
    LEFT: 37,
    NULL: 46,
    RIGHT: 39,
    UP: 38,
    TAB: 9
};

/**
 * Directions
 */

export const MOVE = {
    DOWN: 0,
    LEFT: 1,
    RIGHT: 2,
    UP: 3
}


/**
 * Convert file size bytes into string. Copied from:
 * https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
 */
export const formatBytes = (a, b) => {
    if (a < 0) {
        return '?'
    } else if (a === 0) {
        return '0 Bytes'
    }
    const c=1024
    const d=b||2
    const e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"]
    const f=Math.floor(Math.log(a)/Math.log(c))
    return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]
}


/*
 * Name validity function that returns true if a given value is not equal to
 * a string that is empty or only contains whitespaces.
 */
export const isNotEmptyString = (name) => (name.trim() !== '');


/*
 * Position validity function that returns true if a given value is a
 * non-negative integer.
 */
export const isNonNegativeInt = (value) => {
    return (value && !/[^\d]/.test(value));
};


/**
 * Generate url to show the history of a project branch in the app.
 */
export const branchPageUrl = (projectId, branchId) => {
    return baseHref + 'projects/' + projectId + '/branches/' + branchId + '/history';
}


/**
 * Generate url to show a particular workflow version in the app.
 */
export const notebookPageUrl = (projectId, branchId, workflowId) => {
    let link = baseHref + 'projects/' + projectId + '/branches/' + branchId;
    if (workflowId != null) {
        link += '/workflows/' + workflowId;
    } else {
        link += '/head';
    }
    return link;
}

/**
 * Generate url to show a particular workflow version spreadsheet in the app.
 */
export const spreadsheetPageUrl = (projectId, branchId, datasetId, workflowId) => {
    let link = baseHref + 'projects/' + projectId + '/branches/' + branchId;
    if (workflowId != null) {
        link += '/workflows/' + workflowId + '/spreadsheet/' + datasetId;
    } else {
        link += '/head/spreadsheet/' + datasetId;
    }
    return link;
}

/**
 * Generate url to show a particular workflow version error list in the app.
 */
export const errorListPageUrl = (projectId, branchId, datasetId, workflowId) => {
    let link = baseHref + 'projects/' + projectId + '/branches/' + branchId;
    if (workflowId != null) {
        link += '/workflows/' + workflowId + '/errors/' + datasetId;
    } else {
        link += '/head/errors/' + datasetId;
    }
    return link;
}

/**
 * Return given value or default value if value is null or undefined.
 */
export const valueOrDefault = (val, defaultValue) => ((val != null) ? val : defaultValue);


// -----------------------------------------------------------------------------
// Project page resource
// -----------------------------------------------------------------------------

const RESOURCE_BRANCH = 'RESOURCE_BRANCH';
const RESOURCE_MAIN_PAGE = 'RESOURCE_MAIN_PAGE';
const RESOURCE_NOTEBOOK = 'RESOURCE_NOTEBOOK';
export const RESOURCE_DATASET_CAVEAT = 'RESOURCE_DATASET_CAVEAT';


/**
 * Wrapper for the application resource that are displayed in the resource page
 * component. The resource captures one of the following content types: Branch
 * History Page, Main Page, or Notebook Page.
 */
export class AppResource {
    /**
     * Constructor expects the content type information and a type-specific
     * content object.
     */
    constructor(resourceType, content) {
        this.resourceType = resourceType;
        this.type = resourceType;
        this.content = content; 
    }
    /**
     * Various flags to check the type of the content.
     */
    isBranch = () => (this.resourceType === RESOURCE_BRANCH);
    isMainPage = () => (this.resourceType === RESOURCE_MAIN_PAGE);
    isNotebook = () => (this.resourceType === RESOURCE_NOTEBOOK);
    isError = () => (this.type === CONTENT_ERROR);
    isChart = () => (this.type === CONTENT_CHART);
    isDataset = () => (this.type === CONTENT_DATASET);
    isDatasetCaveat = () => (this.type === RESOURCE_DATASET_CAVEAT);
    
}


// Shortcuts for different content types
export const BranchResource = () => (new AppResource(RESOURCE_BRANCH));
export const MainPageResource = (notebook) => (new AppResource(RESOURCE_MAIN_PAGE));
export const NotebookResource = (notebook) => (new AppResource(RESOURCE_NOTEBOOK));
export const ErrorResource = (title, module) => (new AppResource(CONTENT_ERROR, {title, module}));
export const ChartResource = (name, dataset) => (new AppResource(CONTENT_CHART, {name, dataset}));
export const DatasetCaveatResource = (dataset, annotations) => (new AppResource(RESOURCE_DATASET_CAVEAT, {dataset, annotations}));
export const SpreadsheetResource = (dataset) => (new AppResource(CONTENT_DATASET, dataset));

