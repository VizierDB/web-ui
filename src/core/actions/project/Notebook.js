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

import {fetchAuthed, checkResponseJsonForReAuth, requestAuth, serviceError, getAuthed} from '../main/Service';
import { projectActionError, projectFetchError, requestProjectAction } from './Project';
// import { AnnotationList } from '../../resources/Annotation';
import { DatasetHandle } from '../../resources/Dataset';
import { getNewCellId } from '../../resources/Notebook';
import { OutputChart, OutputDataset, OutputError, OutputHidden,
    OutputTimestamps, StandardOutput } from '../../resources/Outputs';
import { WorkflowHandle } from '../../resources/Workflow';
import { fetchResource, postResourceData } from '../../util/Api';
import { ErrorObject } from '../../util/Error';
import { HATEOASReferences, HATEOAS_BRANCH_HEAD, HATEOAS_MODULE_DELETE,
    HATEOAS_WORKFLOW_CANCEL } from '../../util/HATEOAS';
// import { VIZUAL, VIZUAL_OP } from '../../util/Vizual';


/**
 * Identifier for the supported notebook actions
 */
// Change the value of the group mode state
export const CHANGE_GROUP_MODE = 'CHANGE_GROUP_MODE';
// Insert a new cell into the notebook
export const INSERT_NOTEBOOK_CELL = 'INSERT_NOTEBOOK_CELL';
// Signals for fetching workflow modules
export const RECEIVE_WORKFLOW = 'RECEIVE_WORKFLOW';
export const REQUEST_WORKFLOW = 'REQUEST_WORKFLOW';
// set the active notebook cell
export const SET_ACTIVE_NOTEBOOK_CELL = 'SET_ACTIVE_NOTEBOOK_CELL';
// Update the notebook object in the global state
export const UPDATE_NOTEBOOK = 'UPDATE_NOTEBOOK';


// -----------------------------------------------------------------------------
// Workflows
// -----------------------------------------------------------------------------

/**
 * Fetch project and branch from API. Calls the given result function to
 * fetch further resources on success.
 *
 */
export const fetchWorkflow = (project, branch, workflowId) => (dispatch, getState) => {
    // Construct workflow url from the API reference set. This set may not be
    // initialized yet!
    const api = getState().serviceApi;
    if (api.links) {
        let url = getState().serviceApi.links.getNotebookUrl(project.id, branch.id, workflowId);
        // Signal start of fetching project listing
        dispatch({ type: REQUEST_WORKFLOW });
        // Fetch the project.
        return fetchAuthed(url)(dispatch)
        .then(function(response) {
            if (response.status >= 200 && response.status < 400) {
                // SUCCESS: The returned json object is expected to contain
                // the project handle (.project), workflow handle (.workflow),
                //  workflow modules (.modules), and all dataset descriptors
                // (.datasets). The last two are used to generate the notebook.
                checkResponseJsonForReAuth(response).then(json => (
                    dispatch({
                        type: RECEIVE_WORKFLOW,
                        workflow: new WorkflowHandle(api.engine).fromJson(json)
                    })
                ));
            } else if(response.status === 401) {
            	// UNAUTHORIZED: re-request auth
            	dispatch(requestAuth())
            } else if (response.status === 404) {
                // The requested project, branch, or workflow does not exist.
                checkResponseJsonForReAuth(response).then(json => (dispatch(
                    workflowFetchError(json.message, 404)
                )));
            } else {
                // ERROR: The API is expected to return a JSON object in case
                // of an error that contains an error message
                checkResponseJsonForReAuth(response).then(json => dispatch(
                    workflowFetchError(json.message, response.status)
                ));
            }
        })
        .catch(err => dispatch(workflowFetchError(err.message)))
    }
}


/**
 * Siple wrapper for workflow-specific project errors.
 */
const workflowFetchError = (message, status) => (
    projectFetchError(message, status, 'Error fetching notebook')
);


// -----------------------------------------------------------------------------
// Notebooks
// -----------------------------------------------------------------------------

const getJson = (response, success) => {
    if (response.status === success) {
        return checkResponseJsonForReAuth(response);
    } else {
        return checkResponseJsonForReAuth(response).then(err => {throw err;});
    }
}
/**
 * Check the status of an active notebook cell. If the status of the associated
 * module has changed we fetch the update version of the workflow and update
 * the notebook accordingly.
 */
export const checkModuleStatus = (notebook, cell) => (dispatch) => (
    fetchAuthed(cell.module.links.getSelf())(dispatch).then(
        response => getJson(response, 200),
        error => dispatch(serviceError(error.message))
    ).then(
        json => {
            if (json.state !== cell.module.state) {
            	//TODO: hurry up and tell the interval to die in your render loop, react.  
            	//  Nevermind; hacking for now.  FIXIT: soon
            	clearInterval(window.pollingTimer);
            	return fetchAuthed(notebook.workflow.links.get(HATEOAS_BRANCH_HEAD))(dispatch).then(
                    response => getJson(response, 200),
                    error => dispatch(serviceError(error.message))
                ).then(
                    json => (dispatch(updateNotebook(notebook, json, cell.id))),
                    error => dispatch(workflowFetchError(error.message))
                )
            }
        },
        error => dispatch(setNotebookCellError(notebook, cell.module, 'module status', error.message))
    )
)


/**
 * Dismiss any changes that were made to the given cell. Sets the active cell
 * to null.
 */
export const dismissCellChanges = (notebook, cell) => (dispatch) => {
    dispatch({
        type: UPDATE_NOTEBOOK,
        notebook: notebook.dismissChangesForCell(cell.id)
    })
    dispatch({type: SET_ACTIVE_NOTEBOOK_CELL});
}


/**
 * Start editing a cell in a notebook. The cell is expected to contain a
 * workflow module that contains the command that is being edited.
 */
export const editNotebookCell = (notebook, cell) => ({
    type: UPDATE_NOTEBOOK,
    notebook: notebook.editCell(cell)
})


/**
 * Insert a new cell into the notebook. The position of the new cell is relative
 * to the given cell (either before or after). If cell is null the new cell is
 * being added to an empty notebook.
 *
 * The new cell will be set as the active cell for the modified notebook.
 */
export const createtNotebookCell = (notebook, cell, position) => (dispatch) => {
    // The identifier for the new notebook cell is generated by the getNewCellId
    // method. By calling the method here we get the identifier of the cell that
    // will be added when .editCell() is called. Use this identifier to set the
    // new cell as the active cell in the modified notebook.
    const cellId = getNewCellId(notebook.cellCounter);
    dispatch({
        type: UPDATE_NOTEBOOK,
        notebook: notebook.editCell(cell, position)
    })
    dispatch({
        type: SET_ACTIVE_NOTEBOOK_CELL,
        cellId
    })
}


/**
 * Set the identifier of the notebook cell that is active. The cell might be
 * null if the active cell selection is being cleared.
 */
export const selectNotebookCell = (cell) => {
    let cellId = (cell != null) ? cell.id : null;
    return {
        type: SET_ACTIVE_NOTEBOOK_CELL,
        cellId
    }
}


/**
 * Check the url param cell-output.  if it is present
 */
export const isCellOutputRequest = () => {
	const urlParams = new URLSearchParams(window.location.search);
	const cellOutput = urlParams.get('cell-output');
	return cellOutput;
}



// -----------------------------------------------------------------------------
// Update notebook cells
// -----------------------------------------------------------------------------

/**
 * Load annotations for a given dataset cell to be displayed in a notebook cell.
 * If columnId or rowId are negative a shown annotation is discarded instead.
 */
export const fetchAnnotations = (notebook, module, dataset, columnId, rowId) => (dispatch) => {
    return dispatch(
        fetchResource(
            dataset.links.getAnnotations(columnId, rowId),
            (json) => {
                // const annotations = new AnnotationList(json['annotations'])
                return setActiveDatasetCell(
                    notebook,
                    module
                );
            },
            (message) => {
                setNotebookCellError(notebook, module, 'annotations for dataset ' + dataset.name, message)
            },
            () => (setActiveDatasetCell(notebook, module))
        )
    )
}

/**
 * Update the cell containing the given module in the notebook to indicate that
 * the output content is being loaded.
 */
const setNotebookCellBusy = (notebook, module) => (dispatch) => {
    return dispatch(updateNotebook(notebook.setFetching(module.id)));
}


/**
 * Update the cell containing the given module in the notebook to show an error
 * message that was generated while fetching a cell resource.
 */
const setNotebookCellError = (notebook, module, resourceType, message) => (dispatch) => {
    const err = new ErrorObject('Error loading ' + resourceType, message);
    const nb = notebook.replaceOutput(module.id, new OutputError(err));
    return dispatch(updateNotebook(nb));
}


/**
 * Set the annotation object for a given notebook module.
 */
const setActiveDatasetCell = (notebook, module, cell) => (dispatch) => {
    const nb = notebook.setActiveDatasetCell(module.id, cell);
    return dispatch(updateNotebook(nb));
}
/**
 * Request properties for the specified datatset from the API and recreate the notebook.
 * unstable because it tries to recreate the notebook from the workflow which may or may not get the properties for
 * previously requested data cells depending on if the API updated default module outputs when that request is made.
 */
export const unstable_updateCellDatasetProperties = (notebook, module, dataset, offset, limit, profile) => (dispatch) => {
    let url = dataset.links.getDatasetUrl(offset, limit, profile);
    return fetchAuthed(url)(dispatch).then(
        response => getJson(response, 200),
        error => dispatch(serviceError(error.message))
    ).then(
        json => {
            if (json.properties !== dataset.properties) {
                //refetch the latest workflow since notebook might have been modified since the request to initiate profiling was sent
                return fetchAuthed(notebook.workflow.links.get(HATEOAS_BRANCH_HEAD))(dispatch).then(
                    response => getJson(response, 200),
                    error => dispatch(serviceError(error.message))
                ).then(
                    wfJson => (dispatch(updateNotebookFromProperties(notebook, wfJson, module.id, new OutputDataset(new DatasetHandle(json.id, dataset.name, dataset.activeCell).fromJson(json))))),
                    error => dispatch(workflowFetchError(error.message))
                )
            }
        },
        error => dispatch(setNotebookCellError(notebook, module, 'module status', error.message))
    )
}
/**
 * Request dataset properties from the API and updates the latest notebook
 */
export const updateCellDatasetProperties = (getLatestNotebook, module, dataset, offset, limit, profile) => (dispatch) => {
    // Use dataset self reference to create fect URL
    let url = dataset.links.getDatasetUrl(offset, limit, profile);
    return dispatch(
        fetchResource(
            url,
            (json) => (updateNotebook(
                getLatestNotebook().replaceOutput(
                    module.id,
                    new OutputDataset(
                        new DatasetHandle(
                            json.id,
                            dataset.name,
                            dataset.activeCell
                        ).fromJson(json)
                    )))),
            (message) => (
                setNotebookCellError(getLatestNotebook(), module, 'dataset ' + dataset.name, message)
            )
        )
    )
}

// -----------------------------------------------------------------------------
// Show notebook cell output
// -----------------------------------------------------------------------------

/**
 * Hide output by setting it to an empty text output.
 */
export const hideCellOutput = (notebook, module) => (dispatch) => {
    const out = new OutputHidden();
    dispatch(updateNotebook(notebook.replaceOutput(module.id, out)))
};


/**
 * Show the chart with the given name in the notebook cell.
 */
export const showCellChart = (notebook, module, name) => (dispatch) => {
    // If the chart was in the module output we can directly dispatch it.
    // Otherwise we need to fetch the resource from the server first.
    let isInOutput = false;
    if (module.outputs.stdout.length === 1) {
        if (module.outputs.stdout[0].type === 'chart/view') {
            isInOutput = (module.outputs.stdout[0].value.data.name === name);
        }
    }
    if (isInOutput) {
        const val = module.outputs.stdout[0].value;
        const out = new OutputChart(val.data.name, val.result)
        dispatch(updateNotebook(notebook.replaceOutput(module.id, out)));
    } else {
        // Find the chart descriptor in the module
        let chart = null;
        for (let i = 0; i < module.charts.length; i++) {
            if (module.charts[i].name === name) {
                chart = module.charts[i];
                break;
            }
        }
        if (chart !== null) {
            // Use the chart's self reference to fetch the data frm the Web API.
            const url = new HATEOASReferences(chart.links).getSelf()

            dispatch(
                fetchResource(
                    url,
                    (json) => {
                        const output = new OutputChart(name, json.data);
                        const nb = notebook.replaceOutput(module.id, output);
                        return updateNotebook(nb);
                    },
                    (message) => (
                        setNotebookCellError(notebook, module, 'chart', message)
                    ),
                    () => (setNotebookCellBusy(notebook, module))
            ))
        }
    }
}


/**
 * Show (a subset of rows for) a given dataset in the output area of a notebook
 * cell. The data is fetched from the Web API. The url to fetch the dataset is
 * constructed using the  given offset and limit values.
 */
export const showCellDataset = (notebook, module, dataset, offset, limit) => (dispatch) => {
    // Use dataset self reference to create fect URL
    let url = dataset.links.getDatasetUrl(offset, limit);
    return dispatch(
        fetchResource(
            url,
            (json) => (updateNotebook(
                notebook.replaceOutput(
                    module.id,
                    new OutputDataset(
                        new DatasetHandle(
                            json.id,
                            dataset.name,
                            dataset.activeCell
                        ).fromJson(json)
            )))),
            (message) => (
                setNotebookCellError(notebook, module, 'dataset ' + dataset.name, message)
            )
        )
    )
}


/**
 * Change the output of a notebook cell to show the text that was written to
 * standard output during execution of the workflow module that is associated
 * with the cell.
 */
export const showCellStdout = (notebook, module) => (dispatch) => {
    const out = StandardOutput(module);
    dispatch(updateNotebook(notebook.replaceOutput(module.id, out)))
};


/**
 * Change the output of a notebook cell to show the timestamps for the different
 * stages of cell execution.
 */
export const showCellTimestamps = (notebook, module) => (dispatch) => {
    const { createdAt, startedAt, finishedAt } = module.timestamps;
    const out = new OutputTimestamps(createdAt, startedAt, finishedAt);
    dispatch(updateNotebook(notebook.replaceOutput(module.id, out)))
};


// -----------------------------------------------------------------------------
// Modify Workflow
// -----------------------------------------------------------------------------

/**
 * Cancel execution of a running workflow. The result is handle of the modified
 * workflow. We use this to update the notebook accordingly.
 */
export const cancelWorkflowExecution = (notebook) => (dispatch) => (
    dispatch(
        postResourceData(
            notebook.workflow.links.get(HATEOAS_WORKFLOW_CANCEL),
            {},
            (json) => {
                // Get the new workflow handle
                const wf = new WorkflowHandle(
                    notebook.workflow.engine
                ).fromJson(json);
                return {
                    type: UPDATE_NOTEBOOK,
                    notebook: notebook.updateWorkflow(wf)
                };
            },
            workflowFetchError
        )
    )
)


/**
 * Delete a cell in the current notebook. This action is only applicable to
 * cells that contain an existing module in the current workflow.
 *
 * Expects the module handle as argument. The handle contains the delete url
 * in the set of HATEOAS links. The result of a successful delete request is
 * a Json object that is expected to contain the handle for the new workflow
 * (.workflow) and the information for the workflow notebook (.modules and
 * (.datasets).
 */
export const deleteNotebookCell = (notebook, cell) => (dispatch) => {
    // Signal start by setting the project action flag
    dispatch(requestProjectAction());
    return fetchAuthed(
        cell.module.links.get(HATEOAS_MODULE_DELETE),
        {method: 'DELETE'}
    )(dispatch).then(function(response) {
        if (response.status === 200) {
            // SUCCESS: Dispatch updated notebook for new workflow handle
            checkResponseJsonForReAuth(response).then(json => dispatch(updateNotebook(notebook, json)));
        } else if(response.status === 401) {
        	// UNAUTHORIZED: re-request auth
        	dispatch(requestAuth())
        } else {
            // ERROR: The API is expected to return a JSON object in case
            // of an error that contains an error message
            checkResponseJsonForReAuth(response).then(json => dispatch(
                projectActionError('Error deleting module', json.message)
            ))
        }
    })
    .catch(err => dispatch(
        projectActionError('Error while deleting module', err.message)
    ))
}


/**
 * Insert a new cell into a notebook. The position at which the cell is inserted
 * is identified by the given Url. Creates a POST request using the given
 * data object. The object is expected to contain a valid request body.
 *
 * Parameters:
 *
 * url: string
 * data: {type: string, id: string, arguments: object}
 */
export const insertNotebookCell = (notebook, url, data, modifiedCellId) => (dispatch) => {
    return dispatch(updateNotebookCell(notebook, url, 'POST', data, modifiedCellId));
}


/**
 * Replace a cell in a notebook. The replaced cell is identified by the given
 * Url. Creates a PUT request using the given data object. The object is
 * expected to contain a valid request body.
 *
 * Parameters:
 *
 * url: string
 * data: {type: string, id: string, arguments: object}
 */
export const replaceNotebookCell = (notebook, url, data, modifiedCellId) => (dispatch) => {
    return dispatch(updateNotebookCell(notebook, url, 'PUT', data, modifiedCellId));
}


/**
 * Freeze a specified cell in the notebook an d its successors.
 */
export const freezeOrThawNotebookCell = (notebook, url, modifiedCellId) => (dispatch) => {
    dispatch(updateNotebookCell(notebook, url, 'POST', {}, modifiedCellId));
}


/**
 * Update a cell in a notebook. This could either insert a new notebook cell or
 * replace an existing cell. The data object contains the module specification
 * and user provided input parameters.
 *
 * Parameters:
 *
 * url: string
 * action: POST or PUT
 * data: {type: string, id: string, arguments: object}
 */
export const updateNotebookCell = (notebook, url, action, data, modifiedCellId) => (dispatch) => {
    // Signal start by setting the project action flag
    dispatch(requestProjectAction());
    // Independently of whether we insert or append the request is a POST
    // containing the module specification as its body.
    return fetchAuthed(
        url,
        {
            method: action,
            body: JSON.stringify(data),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }
    )(dispatch).then(function(response) {
        if (response.status === 200) {
            // SUCCESS: Dispatch modified notebook resource. The result is
            // expected to be a Json object with WorkflowHandle (.workflow)
            // and the new nootebook information (.modules and .datasets)
            checkResponseJsonForReAuth(response).then(json => (
                dispatch(updateNotebook(notebook, json, modifiedCellId)))
            );
        } else if(response.status === 401) {
        	// UNAUTHORIZED: re-request auth
        	dispatch(requestAuth())
        } else {
            // ERROR: The API is expected to return a JSON object in case
            // of an error that contains an error message
            checkResponseJsonForReAuth(response).then(json => (dispatch(
                projectActionError('Error updating notebook', json.message)
            )));
        }
    })
    .catch(err => dispatch(
        projectActionError('Error updating notebook', err.message)
    ))
}


/**
 * Update a cell in a notebook. If the new cell command is VIZUAL LOAD we need
 * to upload any specified file first (unless the file has already been uploaded
 * previously which is indicated by a fileid that is not null).
 * After any potential file upload the provided notebook modifier function is
 * called with the approriate request body data.
 *
 * Parameters:
 *
 * modifyUrl: string
 * data: {type: string, id: string, arguments: object}
 * notebookModifier: func(url, data)
 * uploadUrl: string
 *
 */
export const updateNotebookCellWithUpload = (notebook, modifyUrl, data, notebookModifier, modifiedCellId, uploadUrl, fileArg, onProgressUpdate) => (dispatch) => {
    const { file } = fileArg.value;
    const uploadReqData = new FormData();
    uploadReqData.append('file', file);
    const req = {
        method: 'POST',
        body: uploadReqData
    }
    let config = {
        onUploadProgress: function(progressEvent) {
            onProgressUpdate && onProgressUpdate(Math.round( (progressEvent.loaded * 100) / progressEvent.total));
        }
    };
    // updated methodology to use axios post instead of the native fetch() method, to enable upload progress tracking
    return getAuthed(
            uploadUrl,
            req,
            config
        )(dispatch)
        // Check the response. Assume that eveything is all right if status
        // code below 400
        .then(function(response) {
            if (response.status >= 200 && response.status < 400) {
                // SUCCESS: Fetch updated file identifier and modify the
                // request body to update the notebook.
                checkResponseJsonForReAuth(response, false).then(json => {
                    console.log('FILE RESPONSE');
                    console.log(json);
                    fileArg.value.fileid = json.id;
                    console.log('REQ')
                    console.log(data)
                    return dispatch(notebookModifier(notebook, modifyUrl, data, modifiedCellId));
                });
            } else if(response.status === 401) {
            	// UNAUTHORIZED: re-request auth
            	dispatch(requestAuth())
            } else {
                // ERROR: The API is expected to return a JSON object in case
                // of an error that contains an error message. For some response
                // codes, however, this is not true (e.g. 413).
                // TODO: Catch the cases where there is no Json response
                checkResponseJsonForReAuth(response, false).then(json => dispatch(
                    projectActionError('Error updating workflow', json.message))
                )
            }
        })
        .catch(err => {
            let msg = err.message;
            if (msg === 'NetworkError when attempting to fetch resource.') {
                msg = 'Connection closed by server. The file size may exceed the server\'s upload limit.'
            }
            dispatch(projectActionError('Error updating workflow', msg))
        });
}


/**
 * Set notebook resource in the notebook page state. The semantics of the first
 * parameter depends on the presence of the second parameter.
 *
 * If only a notebook is given it is expected to be the new notebook resource.
 * If an additional json object is given this object is expected to contain the
 * workflow handle of the updated workflow. The notebook in this case is the
 * current notebook that needs to be updated using the new workflow handle. The
 * optional modified cell identifier is the identifier of the cell that
 * triggered the update.
 */
export const updateNotebook = (notebook, json, modifiedCellId) => {
    // Create an updated notebook resource if the workflow handle is given
    if (json != null) {
        const wf = new WorkflowHandle(notebook.workflow.engine).fromJson(json);
        notebook = notebook.updateWorkflow(wf, modifiedCellId);
    }
    return {
        type: UPDATE_NOTEBOOK,
        notebook: notebook
    }
};
/***
 * Create a new notebook from the latest workflow and new dataset handle with properties
 */
export const updateNotebookFromProperties = (notebook, wfJson, modifiedCellId, outputDataset)=> {
    const wf = new WorkflowHandle(notebook.workflow.engine).fromJson(wfJson);
    return {
        type: UPDATE_NOTEBOOK,
        notebook: notebook
            .updateWorkflow(wf, modifiedCellId)
            .replaceOutput(modifiedCellId, outputDataset)
    }
}