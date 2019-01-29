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
    projectActionError, receiveProjectResource, requestProjectAction,
    updateResource, updateWorkflowResource
} from '../project/ProjectPage';
import { fetchAuthed, requestAuth } from '../main/Service';
import {
    CellAnnotation, NoAnnotation, IsFetching, FetchError, AnnotationList
} from '../../resources/Annotation';
import { DatasetHandle } from '../../resources/Dataset';
import {
    Notebook, OutputChart, OutputDataset, OutputError, OutputText
} from '../../resources/Notebook';
import { NotebookResource } from '../../resources/Project';
import { WorkflowHandle } from '../../resources/Workflow';
import { fetchResource } from '../../util/Api';
import { ErrorObject } from '../../util/Error';
import { VIZUAL, VIZUAL_OP } from '../../util/Vizual';

// Change the value of the group mode state
export const CHANGE_GROUP_MODE = 'CHANGE_GROUP_MODE';
// Reverse notebook cell order
export const REVERSE_ORDER = 'REVERSE_ORDER';


// -----------------------------------------------------------------------------
// Display
// -----------------------------------------------------------------------------

/**
 * Change the value of group mode.
 */
export const changeGroupMode = (mode) => ({
    type: CHANGE_GROUP_MODE,
    mode
})


/**
 * Reverse ordering of notebook cells.
 */
export const reverseOrder = () => ({
    type: REVERSE_ORDER
})


/**
 * Update the cell containing the given module in the notebook to indicate that
 * the output content is being loaded.
 */
const setNotebookCellBusy = (notebook, module) => (dispatch) => {
    const nb = notebook.setFetching(module.id);
    return dispatch(updateResource(new NotebookResource(nb)));
}


/**
 * Update the cell containing the given module in the notebook to show an error
 * message that was generated while fetching a cell resource.
 */
const setNotebookCellError = (notebook, module, resourceType, message) => (dispatch) => {
    const err = new ErrorObject('Error loading ' + resourceType, message);
    const nb = notebook.replaceOutput(module.id, new OutputError(err));
    return dispatch(updateResource(new NotebookResource(nb)));
}


export const showCellChart = (notebook, module, name) => (dispatch) => {
    // If the chart was in the module output we can directly dispatch it.
    // Otherwise we need to fetch the resource from the server first.
    let isInOutput = false;
    if (module.stdout.length === 1) {
        if (module.stdout[0].type === 'chart/view') {
            isInOutput = (module.stdout[0].name === name);
        }
    }
    if (isInOutput) {
        const output = new OutputChart(name, module.stdout[0].result);
        const nb = notebook.replaceOutput(module.id, output);
        return dispatch(updateResource(new NotebookResource(nb)));
    } else {
        // Find the chart descriptor in the module
        let chart = null;
        for (let i = 0; i < module.views.length; i++) {
            if (module.views[i].name === name) {
                chart = module.views[i];
                break;
            }
        }
        if (chart !== null) {
            // Use the chart's self reference to fetch the data frm the Web API.
            return dispatch(
                fetchResource(
                    chart.links.self,
                    (json) => {
                        const output = new OutputChart(name, json);
                        const nb = notebook.replaceOutput(module.id, output);
                        return dispatch(updateResource(new NotebookResource(nb)));
                    },
                    (message) => (
                        setNotebookCellError(notebook, module, 'chart', message)
                    ),
                    () => (setNotebookCellBusy(notebook, module))
                )
            )
        }
    }
}


/**
 * Load annotations for a given dataset cell to be displayed in a notebook cell.
 * If columnId or rowId are negative a shown annotation is discarded instead.
 */
export const showCellAnnotations = (notebook, module, dataset, columnId, rowId) => (dispatch) => {
    if ((columnId < 0) || (rowId < 0)) {
        return dispatch(setCellAnnotations(notebook, module, new NoAnnotation()));
    } else {
        return dispatch(
            fetchResource(
                dataset.links.annotations + '?column=' + columnId + '&row=' + rowId,
                (json) => {
                    const content = new AnnotationList(json['annotations'])
                    const annotation = new CellAnnotation(columnId, rowId, content);
                    return setCellAnnotations(notebook, module, annotation);
                },
                (message) => {
                    const err = new FetchError('Error loading annotations', message);
                    const annotation = new CellAnnotation(columnId, rowId, err);
                    return setCellAnnotations(notebook, module, annotation);
                },
                () => (setCellAnnotations(notebook, module, new CellAnnotation(columnId, rowId, new IsFetching())))
            )
        )
    }
}


/**
 * Set the annotation object for a given notebook module.
 */
const setCellAnnotations = (notebook, module, annotation) => (dispatch) => {
    dispatch(updateResource(
            new NotebookResource(
                notebook.showAnnotations(module.id, annotation)
            )
        )
    );
}


/**
 * Show a dataset in the output area of a notebook cell. The dataset is
 * identified by the name and fetched from the Web API.
 *
 * The url to fetch the dataset is optional. If the user is navigating a dataset
 * that is already being displayed in the output area then the url will be
 * given. Otherwise, we use the self reference in the link collection of the
 * dataset descriptor.
 */
export const showCellDataset = (notebook, module, name, url) => (dispatch) => {
    // Find the dataset handle in the module's dataset list
    let dataset = null;
    for (let i = 0; i < module.datasets.length; i++) {
        const ds = module.datasets[i];
        if (ds.name === name) {
            dataset = ds;
            break;
        }
    }
    if (dataset !== null) {
        // Use dataset self reference if url is undefined.
        let fetchUrl = (url != null) ? url : dataset.links.self;
        return dispatch(
            fetchResource(
                fetchUrl,
                (json) => {
                    const ds = new DatasetHandle(json.id, name).fromJson(json);
                    const output = OutputDataset(name, ds);
                    const nb = notebook.replaceOutput(module.id, output);
                    return dispatch(updateResource(new NotebookResource(nb)));
                },
                (message) => (
                    setNotebookCellError(notebook, module, 'dataset', message)
                ),
                () => (setNotebookCellBusy(notebook, module))
            )
        )
    }
}


/**
 * Change the output of a notebook cell to show the text that was written to
 * standard output during execution of the workflow module that is associated
 * with the cell.
 */
export const showCellStdout = (notebook, module) => (dispatch) => (
    dispatch(
        updateResource(
            new NotebookResource(
                notebook.replaceOutput(module.id, OutputText(module.stdout))
            )
        )
    )
);


/**
 * Load notebook information for the given workflow. Set the result as the
 * content of the project page.
 *
 * Parameters:
 *
 * workflow: WorkflowHandle
 *
 */
export const showNotebook = (workflow) => (dispatch) => {
    dispatch(
        fetchResource(
            workflow.links.modules,
            (json) => (dispatch) => {
                return dispatch(
                    receiveProjectResource(
                        new NotebookResource(new Notebook().fromJson(json))
                    )
                );
            },
            (message) => (
                projectActionError('Error loading notebook', message)
            ),
            requestProjectAction
        )
    )
}



// -----------------------------------------------------------------------------
// Modify Workflow
// -----------------------------------------------------------------------------

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
export const deleteNotebookCell = (module) => (dispatch) => {
    // Signal start by setting the project action flag
    dispatch(requestProjectAction());
    return fetchAuthed(
        module.links.delete,
        {method: 'DELETE'}
    )(dispatch).then(function(response) {
        if (response.status === 200) {
            // SUCCESS: Dispatch modified workflow handle
            response.json().then(json => (dispatch(updateNotebook(json))));
        } else if(response.status === 401) {
        	// UNAUTHORIZED: re-request auth
        	dispatch(requestAuth())
        } else {
            // ERROR: The API is expected to return a JSON object in case
            // of an error that contains an error message
            response.json().then(json => dispatch(
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
export const insertNotebookCell = (url, data) => (dispatch) => {
    return dispatch(updateNotebookCell(url, 'POST', data));
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
export const replaceNotebookCell = (url, data) => (dispatch) => {
    return dispatch(updateNotebookCell(url, 'PUT', data));
}


/**
 * Set notebook resource and workflow handle after the notebook was updated.
 * Expects a Josn object that contains a WorkflowUpdateResult returned by
 * the Web API.
 */
const updateNotebook = (json) => (dispatch) => {
    // Expects the Json object to have properties .workflow, .modules, and
    // .datasets.
    return dispatch(
        updateWorkflowResource(
            new WorkflowHandle().fromJson(json.workflow),
            new NotebookResource(new Notebook().fromJson(json))
        )
    );
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
export const updateNotebookCell = (url, action, data) => (dispatch) => {
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
            response.json().then(json => (dispatch(updateNotebook(json))));
        } else if(response.status === 401) {
        	// UNAUTHORIZED: re-request auth
        	dispatch(requestAuth())
        } else {
            // ERROR: The API is expected to return a JSON object in case
            // of an error that contains an error message
            response.json().then(json => (dispatch(
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
export const updateNotebookCellWithUpload = (modifyUrl, data, notebookModifier, uploadUrl) => (dispatch) => {
    // Check if the command is a VIZUAL LOAD that does not have a fileid yet. In
    // this case we need to upload a given file.
    if (data.arguments.file != null) {
        const {file, fileid, url } = data.arguments.file;
        if ((data.type === VIZUAL_OP) && (data.id === VIZUAL.LOAD) && (fileid === null)) {
            // The request body for the upload depends on whether we upload file
            // from local disk or from an Url.
            let uploadReqData = null;
            let req = {
                method: 'POST'
            }
            if (file != null) {
                uploadReqData = new FormData();
                uploadReqData.append('file', file);
                req['body'] = uploadReqData
            } else {
                req['body'] = JSON.stringify({'url': url});
                req['headers'] = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }
            return fetchAuthed(
                    uploadUrl,
                    req
                )(dispatch)
                // Check the response. Assume that eveything is all right if status
                // code below 400
                .then(function(response) {
                    if (response.status >= 200 && response.status < 400) {
                        // SUCCESS: Fetch updated file identifier and modify the
                        // request body to update the notebook.
                        response.json().then(json => {
                            const { filename, url } = data.arguments.file;
                            const modArgs = {...data.arguments, file: {fileid: json.id, filename, url}}
                            const modData = {...data, arguments: modArgs};
                            return dispatch(notebookModifier(modifyUrl, modData));
                        });
                    } else if(response.status === 401) {
                    	// UNAUTHORIZED: re-request auth
                    	dispatch(requestAuth())
                    } else {
                        // ERROR: The API is expected to return a JSON object in case
                        // of an error that contains an error message. For some response
                        // codes, however, this is not true (e.g. 413).
                        // TODO: Catch the cases where there is no Json response
                        response.json().then(json => dispatch(
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
        } else {
            return dispatch(notebookModifier(modifyUrl, data));
        }
    } else {
        return dispatch(notebookModifier(modifyUrl, data));
    }
}
