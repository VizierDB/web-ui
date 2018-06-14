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
    return fetch(
        module.links.delete,
        {method: 'DELETE'}
    ).then(function(response) {
        if (response.status === 200) {
            // SUCCESS: Dispatch modified workflow handle
            response.json().then(json => (dispatch(updateNotebook(json))));
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
 * Insert a new cell into a notebook. The data object contains the moduel
 * specification and user provided input parameters. Updates the underlying
 * workflow by inserting a new module. The module may either be inserted before
 * an existing module or appended at the end of the workflow. This behavior is
 * encoded in the given url.
 */
export const insertNotebookCell = (url, data) => (dispatch) => {
    // Signal start by setting the project action flag
    dispatch(requestProjectAction());
    // Independently of whether we insert or append the request is a POST
    // containing the module specification as its body.
    return fetch(
        url,
        {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }
    ).then(function(response) {
        if (response.status === 200) {
            // SUCCESS: Dispatch modified notebook resource. The result is
            // expected to be a Json object with WorkflowHandle (.workflow)
            // and the new nootebook information (.modules and .datasets)
            response.json().then(json => (dispatch(updateNotebook(json))));
        } else {
            // ERROR: The API is expected to return a JSON object in case
            // of an error that contains an error message
            response.json().then(json => (dispatch(
                projectActionError('Error inserting module', json.message)
            )));
        }
    })
    .catch(err => dispatch(
        projectActionError('Error inserting module', err.message)
    ))
}


/**
 * Replace a module in an existing workflow.
 */
export const replaceNotebookCell = (module, data) => (dispatch) => {
    // Signal start by setting the project action flag
    dispatch(requestProjectAction());
    // Replace the existing module via PUT request
    return fetch(
        module.links.replace,
        {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }
    ).then(function(response) {
        if (response.status === 200) {
            // SUCCESS: Dispatch modified workflow handle
            response.json().then(json => (dispatch(updateNotebook(json))));
        } else {
            // ERROR: The API is expected to return a JSON object in case
            // of an error that contains an error message
            response.json().then(json => (dispatch(
                projectActionError('Error replacing module', json.message)
            )));
        }
    })
    .catch(err => dispatch(
        projectActionError('Error replacing module', err.message)
    ))
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
