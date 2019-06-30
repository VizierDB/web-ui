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
import {
    CellAnnotation, NoAnnotation, IsFetching, FetchError, AnnotationList
} from '../../resources/Annotation';
import { DatasetHandle } from '../../resources/Dataset';
// import { Notebook } from '../../resources/Notebook';
import { SpreadsheetResource, DatasetErrorResource } from '../../util/App'
// import { WorkflowHandle } from '../../resources/Workflow';
import { fetchResource, postResourceData } from '../../util/Api';
import { fetchAuthed, requestAuth } from '../main/Service';
import { HATEOAS_MODULE_APPEND } from '../../util/HATEOAS';

// Actions to indicate that the spreadsheet is currently being updated
export const SUBMIT_UPDATE_REQUEST = 'SUBMIT_UPDATE_REQUEST';
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
                    new SpreadsheetResource(
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
 * Show a dataset errors as the content of the project page. The url parameter is
 * optional. If not given, loads the spreadsheet datat using the .self url from
 * the given dataset descriptor.
 *
 * Parameters:
 *
 * dataset: DatasetDescriptor
 *
 */
export const showDatasetError = (dataset, url) => (dispatch) => {
    let fetchUrl = null;
    if (url) {
        fetchUrl = url;
    } else {
        fetchUrl = dataset.links.self +'/annotations';
    }
    dispatch(
        fetchResource(
            fetchUrl,
            (json) => (dispatch) => {
                return dispatch(receiveProjectResource(
                    new DatasetErrorResource(
                        new DatasetHandle(dataset.id, dataset.name),
                        new AnnotationList(json['annotations'])
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

export const repairDatasetError = (dataset, url, reason, repair, acknowledge) => (dispatch) => {
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
                    new DatasetErrorResource(
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

export const submitUpdate = (workflow, dataset, cmd) => (dispatch) => {
    // const { name, offset } = dataset;
	const upcmd = cmd;
    dispatch(submitUpdateRequest());
    return fetchAuthed(
            workflow.links.get(HATEOAS_MODULE_APPEND),
            {
                method: 'POST',
                body: JSON.stringify({...cmd}),
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
            }
        )(dispatch)
        // Check the response. Assume that eveything is all right if status
        // code below 400
        .then(function(response) {
            if (response.status >= 200 && response.status < 400) {
                // SUCCESS: Pass the JSON result to the respective callback
                // handler
                response.json().then(json => {
                	let upds = dataset
                	if(upcmd.packageId === "vizual" && upcmd.commandId === "updateCell"){
                		upds.rows.find((row) => (row.id === upcmd.arguments[2].value)).values[upcmd.arguments[1].value] = upcmd.arguments[3].value
                	}
                	dispatch(receiveProjectResource(
                            new SpreadsheetResource(upds)));
                });
            } else if(response.status === 401) {
            	// UNAUTHORIZED: re-request auth
            	dispatch(requestAuth())
            } else {
                // ERROR: The API is expected to return a JSON object in case
                // of an error that contains an error message
                response.json().then(json => dispatch(
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
    if ((columnId < 0) || (rowId < 0)) {
        return dispatch(clearAnnotations());
    } else {
        return dispatch(
            fetchResource(
                dataset.links.annotations + params,
                (json) => {
                    const content = new AnnotationList(json['annotations'])
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
    return postResourceData(
        dispatch,
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
    );
}

export const setAnnotations = (annotations) => ({
    type: SET_ANNOTATIONS,
    annotations
})

export const updateAnnotations = (dataset, columnId, rowId, key, value) => (dispatch) => {
    const data = {
        columnId,
        rowId,
        key,
        value
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
