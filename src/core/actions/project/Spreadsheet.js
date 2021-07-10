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

import {
    projectActionError, receiveProjectResource, requestProjectAction } from './Project';
import { updateNotebook } from './Notebook';
import {
    CellAnnotation, NoAnnotation, IsFetching, FetchError, AnnotationList
} from '../../resources/Annotation';
import { DatasetHandle } from '../../resources/Dataset';
//import { WorkflowHandle } from '../../resources/Workflow';
// import { Notebook } from '../../resources/Notebook';
import { SpreadsheetResource, DatasetCaveatResource } from '../../util/App'
// import { WorkflowHandle } from '../../resources/Workflow';
import { fetchResource, postResourceData } from '../../util/Api';
import { fetchAuthed, checkResponseJsonForReAuth, requestAuth } from '../main/Service';
import { HATEOAS_MODULE_APPEND } from '../../util/HATEOAS';
import { VIZUAL_OP, VIZUAL } from '../../util/Vizual'
// Actions to indicate that the spreadsheet is currently being updated
export const SUBMIT_UPDATE_REQUEST = 'SUBMIT_UPDATE_REQUEST';
//Actions to indicate that the dataset caveats are currently being updated
export const REQUEST_CAVEATS = 'REQUEST_CAVEATS';
// Set the cell annotation object for a selected dataset cell
export const SET_ANNOTATIONS = 'SET_ANNOTATIONS';
// Signal an update to the datasets annotations
export const UPDATE_DATASET_ANNOTATIONS = 'UPDATE_DATASET_ANNOTATIONS'


/**
 * Show a spreadsheet as the content of the project page. The url parameter is
 * optional. If not given, loads the spreadsheet datat using the .self url from
 * the given dataset descriptor.
 *
 * Parameters:
 *
 * dataset: DatasetDescriptor
 *
 */
export const showSpreadsheet = (dataset, url) => (dispatch) => {
	const { id, name, offset } = dataset;
	let fetchUrl = null;
	let dsoffset = 0;
    if(offset){
    	dsoffset = offset;
    }	
	if (url) {
        fetchUrl = url;
    } else {
        fetchUrl = dataset.links.getDatasetUrl(dsoffset, 25);
    }
    dispatch(
        fetchResource(
            fetchUrl,
            (json) => (dispatch) => {
                return dispatch(receiveProjectResource(
                    SpreadsheetResource(
                        new DatasetHandle(id, name)
                            .fromJson(json)
                    )
                ));
            },
            (message) => (
                projectActionError('Error loading spreadsheet', message)
            ),
            requestProjectAction
        )
    )
}

/**
 * Show (a subset of rows for) a given dataset in the output area of a notebook
 * cell. The data is fetched from the Web API. The url to fetch the dataset is
 * constructed using the  given offset and limit values.
 */
export const showModuleSpreadsheet = (dataset, offset, limit, moduleId) => (dispatch) => {
    // Use dataset self reference to create fect URL
    let url = dataset.links.getDatasetUrl(offset, limit);
    dispatch(
        fetchResource(
            url,
            (json) => (dispatch) => {
            	json.moduleId = moduleId;
                return dispatch(receiveProjectResource(
                    SpreadsheetResource(
                        new DatasetHandle(
                            json.id,
                            dataset.name
                        ).fromJson(json)
                    )
                ));
            },
            (message) => (
            		projectActionError('Error loading spreadsheet', message)
            )
        )
    )
}

/**
 * Show a dataset errors as the content of the project page. The url parameter is
 * optional. If not given, loads the spreadsheet datat using the .self url from
 * the given dataset descriptor.
 *
 * Parameters:
 *
 * dataset: DatasetDescriptor
 *
 */
export const showDatasetCaveat = (dataset, url) => (dispatch) => {
    let fetchUrl = null;
    if (url) {
        fetchUrl = url;
    } else {
        fetchUrl = dataset.links.self +'/annotations';
    }
    dispatch(submitCaveatRequest());
    dispatch(
        fetchResource(
            fetchUrl,
            (json) => (dispatch) => {
                return dispatch(receiveProjectResource(
                    DatasetCaveatResource(
                        new DatasetHandle(dataset.id, dataset.name),
                        new AnnotationList(json)
                    )
                ));
            },
            (message) => (
                projectActionError('Error loading dataset errors', message)
            ),
            requestProjectAction
        )
    )
}

export const repairDatasetCaveat = (dataset, url, reason, repair, acknowledge) => (dispatch) => {
    const data = {
    		reason,
            repair,
            acknowledge
        }
    const columnId = -1
    const rowId = '-1'
    return postResourceData(
            dispatch,
            url,
            data,
            (json) => (dispatch) => {
                return dispatch(receiveProjectResource(
                    DatasetCaveatResource(
                        new DatasetHandle(dataset.id, dataset.name),
                        new AnnotationList(json['annotations'])
                    )
                ));
            },
            (message) => {
                const err = new FetchError('Error loading annotations', message);
                const annotation = new CellAnnotation(columnId, rowId, err);
                return setAnnotations(annotation);
            },
            requestProjectAction
        );
    }

export const submitUpdate = (notebook, dataset, cmd, moduleIndex) => (dispatch) => {
    // const { name, offset } = dataset;
	const upcmd = cmd;
    dispatch(submitUpdateRequest());
    const updateBody = {
            method: 'POST',
            body: JSON.stringify({...cmd}),
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
        };
    let update = null;
    if(moduleIndex){
    	const url = notebook.workflow.modules[moduleIndex].links[0].href;
    	update = fetchAuthed(
    			url,
                updateBody
            );
    }
    else {
    	update = fetchAuthed(
    			notebook.workflow.links.get(HATEOAS_MODULE_APPEND),
                updateBody
            );
    }
    
    return update(dispatch)
        // Check the response. Assume that eveything is all right if status
        // code below 400
        .then(function(response) {
            if (response.status >= 200 && response.status < 400) {
                // SUCCESS: Pass the JSON result to the respective callback
                // handler
                checkResponseJsonForReAuth(response).then(json => {
                	let upds = dataset
                	let moduleId = "__0__";
                	if(moduleIndex){
                		let newModuleIndex = moduleIndex;
                		const newModuleId = json.modules[newModuleIndex].id;
                		moduleId = json.modules[moduleIndex-1].id;
                    	upds.moduleId = newModuleId;
                    	upds.moduleIndex = newModuleIndex;
                	}
                	//add updates to current dataset -- trick to make not need to wait for dataset fetch
                	if(upcmd.packageId === VIZUAL_OP && upcmd.commandId === VIZUAL.UPDATE_CELL){
                		upds.rows.find((row) => (row.id === upcmd.arguments[2].value)).values[upcmd.arguments[1].value] = upcmd.arguments[3].value
                	}
                	if(upcmd.packageId === VIZUAL_OP && upcmd.commandId === VIZUAL.RENAME_COLUMN){
                		upds.columns.find((col) => (col.id === upcmd.arguments[1].value)).name = upcmd.arguments[2].value
                	}
                	
                	else if(upcmd.packageId === "mimir" && upcmd.commandId === "comment"){
                		const colName = upcmd.arguments[1].value[0][0].value;
                		const nameEquals = (col) => col.name === colName;
                		const columnId = upds.columns.findIndex(nameEquals); 
                		upds.rows.find((row) => (row.id === upcmd.arguments[1].value[0][2].value)).rowAnnotationFlags[columnId] = false
                	}
                	//we shoule also fire off a fetch of the new dataset here or something more clever that needs to be designed 
                	// like partial spreadsheet fetch like above but the right way. 
                	//const wf = new WorkflowHandle(notebook.workflow.engine).fromJson(json);
                	dispatch(updateNotebook(notebook, json, moduleId));
                	dispatch(receiveProjectResource(
                            SpreadsheetResource(upds)));
                	
                });
            } else if(response.status === 401) {
            	// UNAUTHORIZED: re-request auth
            	dispatch(requestAuth())
            } else {
                // ERROR: The API is expected to return a JSON object in case
                // of an error that contains an error message
                checkResponseJsonForReAuth(response).then(json => dispatch(
                    projectActionError('Error updating spreadsheet', json.message))
                );
            }
        })
        .catch(err => dispatch(
            projectActionError('Error updating spreadsheet', err.message))
        )
}


/**
 * Signal that the spreadsheet is currently being updated.
 */
export const submitUpdateRequest = () => ({
    type: SUBMIT_UPDATE_REQUEST
})

/**
 * Signal that the dataset caveats are currently being updated.
 */
export const submitCaveatRequest = () => ({
    type: REQUEST_CAVEATS
})

// -----------------------------------------------------------------------------
// Annotations
// -----------------------------------------------------------------------------

/**
 * Close an annotation dialog by setting the current annotation object to null.
 */
export const clearAnnotations = () => (setAnnotations(new NoAnnotation()));

export const deleteAnnotations = (dataset, columnId, rowId, annoId) => (dispatch) => {
    const data = {
        columnId,
        rowId,
        annoId
    }
    return postUpdateRequest(
        dispatch,
        dataset.links.annotations,
        data,
        dataset,
        columnId,
        rowId
    );
}

export const fetchAnnotations = (dataset, columnId, rowId) => (dispatch) => {
    let params = '?column=' + columnId + '&row=' + rowId;
    let annoLink = '';
    if(dataset.links.annotations){
    	annoLink = dataset.links.annotations + params;
    }
    else{
    	annoLink = dataset.links.links[3].href + params;
    }
    if ((columnId < 0)) {
        return dispatch(clearAnnotations());
    } else {
        return dispatch(
            fetchResource(
            	annoLink,
                (json) => {
                    const content = new AnnotationList(json)
                    const annotation = new CellAnnotation(columnId, rowId, content);
                    return setAnnotations(annotation);
                },
                (message) => {
                    const err = new FetchError('Error loading annotations', message);
                    const annotation = new CellAnnotation(columnId, rowId, err);
                    return setAnnotations(annotation);
                },
                () => (setAnnotations(new CellAnnotation(columnId, rowId, new IsFetching())))
            )
        )
    }
}


const postUpdateRequest = (dispatch, url, data, dataset, columnId, rowId) => {
    return dispatch(postResourceData(
        url,
        data,
        (json) => {
            const content = new AnnotationList(json['annotations'])
            const annotation = new CellAnnotation(columnId, rowId, content);
            const isAnnotated = (json['annotations'].length > 0);
            dispatch({
                type: UPDATE_DATASET_ANNOTATIONS,
                dataset: dataset.updateAnnotations(columnId, rowId, isAnnotated)
            });
            return setAnnotations(annotation);
        },
        (message) => {
            const err = new FetchError('Error loading annotations', message);
            const annotation = new CellAnnotation(columnId, rowId, err);
            return setAnnotations(annotation);
        },
        () => (setAnnotations(new CellAnnotation(columnId, rowId, new IsFetching())))
    ));
}

export const setAnnotations = (annotations) => ({
    type: SET_ANNOTATIONS,
    annotations
})

export const updateAnnotations = (dataset, columnId, rowId, key, value) => (dispatch) => {
    const oldValue = ''
    const newValue = value
	const data = {
        columnId,
        rowId,
        key,
        oldValue,
        newValue
    }
    let annoLink = '';
    if(dataset.links.annotations){
    	annoLink = dataset.links.annotations;
    }
    else{
    	annoLink = dataset.links.links[4].href;
    }
    return postUpdateRequest(
        dispatch,
        annoLink,
        data,
        dataset,
        columnId,
        rowId
    );
}
