import {
    projectActionError, receiveProjectResource, requestProjectAction,
    updateWorkflowResource
} from '../project/ProjectPage';
import { DatasetHandle } from '../../resources/Dataset';
import { Notebook } from '../../resources/Notebook';
import { ErrorResource, SpreadsheetResource } from '../../resources/Project'
import { WorkflowHandle } from '../../resources/Workflow';
import { fetchResource } from '../../util/Api';


// Actions to indicate that the spreadsheet is currently being updated
export const SUBMIT_UPDATE_REQUEST = 'SUBMIT_UPDATE_REQUEST';


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
    let fetchUrl = null;
    if (url != null) {
        fetchUrl = url;
    } else {
        fetchUrl = dataset.links.self;
    }
    dispatch(
        fetchResource(
            fetchUrl,
            (json) => (dispatch) => {
                return dispatch(receiveProjectResource(
                    new SpreadsheetResource(
                        new DatasetHandle(dataset.id, dataset.name)
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


export const submitUpdate = (workflow, dataset, cmd) => (dispatch) => {
    const { name, offset } = dataset;
    dispatch(submitUpdateRequest());
    return fetch(
            workflow.links.append,
            {
                method: 'POST',
                body: JSON.stringify({...cmd, includeDataset: {name, offset}}),
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
            }
        )
        // Check the response. Assume that eveything is all right if status
        // code below 400
        .then(function(response) {
            if (response.status >= 200 && response.status < 400) {
                // SUCCESS: Pass the JSON result to the respective callback
                // handler
                response.json().then(json => {
                    const wf = new WorkflowHandle().fromJson(json.workflow);
                    let resource = null;
                    const includedDataset = json['dataset'];
                    if (includedDataset !== undefined) {
                        const ds = new DatasetHandle(
                            includedDataset.id,
                            dataset.name
                        ).fromJson(includedDataset);
                        resource = new SpreadsheetResource(ds);
                    } else {
                        // Find the first module containing an error
                        let module = null;
                        const cells = new Notebook().fromJson(json).cells;
                        for (let i = 0; i < cells.length; i++) {
                            const cell = cells[i];
                            if (cell.hasError()) {
                                module = cell.module;
                                break;
                            }
                        }
                        const title = 'Error updating dataset ' + dataset.name;
                        resource = new ErrorResource(title, module);
                    }
                    return dispatch(updateWorkflowResource(wf, resource));
                });
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
