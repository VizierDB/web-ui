import { DEFAULT_BRANCH } from '../../resources/Branch';
import { Notebook } from '../../resources/Notebook';
import { NotebookResource, ProjectHandle } from '../../resources/Project';
import { WorkflowHandle } from '../../resources/Workflow';
import { getProperty, updateResourceProperty } from '../../util/Api';
import { valueOrDefault } from '../../util/App';
import { ErrorObject } from '../../util/Error';


// Actions for fetching project information from Web API.
export const PROJECT_FETCH_ERROR = 'PROJECT_FETCH_ERROR';
export const RECEIVE_PROJECT = 'RECEIVE_PROJECT';
export const REQUEST_PROJECT = 'REQUEST_PROJECT';

// Actions when fetching or manipulating project resources
export const PROJECT_ACTION_ERROR = 'PROJECT_ACTION_ERROR';
export const RECEIVE_PROJECT_RESOURCE = 'RECEIVE_PROJECT_RESOURCE';
export const REQUEST_PROJECT_ACTION = 'REQUEST_PROJECT_ACTION';
export const UPDATE_BRANCH = 'UPDATE_BRANCH';
export const UPDATE_PROJECT = 'UPDATE_PROJECT';
export const UPDATE_RESOURCE = 'UPDATE_RESOURCE';
export const UPDATE_WORKFLOW = 'UPDATE_WORKFLOW';


 /**
  * Fetch project and workflow handles when showing the project page. By default
  * the notebook resource for the requested project workflow is loaded.
  *
  * Makes use of the notebooks url pattern that the API provides. The notebooks
  * url provides access to project handle, workflow handle and workflow modules
  * with a single request.
 *
 */
export const fetchProject = (identifier, branch, version) => (dispatch, getState) => {
    // Get notebooks url from the API reference set. This set may not have been
    // initialized yet!
    if (getState().serviceApi.links) {
        let url = getState().serviceApi.links.notebooks;
        // The notebooks url takes project, branch, and workflow identifier as
        // query arguments. Use default values for branch and workflow version
        // in case the arguments are not given
        url += '?project=' + encodeURI(identifier);
        url += '&branch=' + encodeURI(valueOrDefault(branch, DEFAULT_BRANCH));
        url += '&version=' + valueOrDefault(version, -1);
        // Signal start of fetching project listing
        dispatch(requestProject())
        // Fetch the project.
        return fetch(url)
        .then(function(response) {
            if (response.status >= 200 && response.status < 400) {
                // SUCCESS: The returned json object is expected to contain
                // the project handle (.project), workflow handle (.workflow),
                //  workflow modules (.modules), and all dataset descriptors
                // (.datasets). The last two are used to generate the notebook.
                response.json().then(json => {
                    dispatch({
                        type: RECEIVE_PROJECT,
                        project: new ProjectHandle().fromJson(json.project),
                        workflow: new WorkflowHandle().fromJson(json.workflow)
                    });
                    return dispatch(
                        receiveProjectResource(
                            new NotebookResource(new Notebook().fromJson(json))
                        )
                    );
                });
            } else if (response.status === 404) {
                // The requested project, branch, or workflow does not exist.
                response.json().then(json => (dispatch(
                    projectFetchError(json.message, 404)
                )));
            } else {
                // ERROR: The API is expected to return a JSON object in case
                // of an error that contains an error message
                response.json().then(json => dispatch(
                    projectFetchError(json.message, response.status)
                ));
            }
        })
        .catch(err => dispatch(projectFetchError(err.message)))
    }
}

/**
 * Set the resource that is shown as page content. Expects a ProjectResource
 * object.
 *
 */
export const receiveProjectResource = (resource) => ({
    type: RECEIVE_PROJECT_RESOURCE,
    resource: resource
})


// -----------------------------------------------------------------------------
// Updates
// -----------------------------------------------------------------------------

/**
 * Replace all occurrences of a branch in the given project and workflow
 * handles. Creates copies of the handles that will contain the given branch
 * instead of an outdated handle for the same branch (branches are identified
 * based on equality of branch ids).
 *
 * Parameters:
 *
 * project: ProjectHandle
 * workflow: WorkflowHandle
 * branch: BranchDescriptor
 *
 */
export const replaceCurrentBranch = (project, workflow, branch) => (dispatch) => {
    dispatch({
        type: UPDATE_BRANCH,
        project: project.updateBranch(branch),
        workflow: workflow.updateBranch(branch)
    });
}


/**
 * .Update the name of the current project. Send a post request to the API
 * and modify the project handle in the global state.
 */
export const updateProjectName = (project, name) => (dispatch) => {
    dispatch(
        updateResourceProperty(
            project.links.update,
            'name',
            name,
            (json) => (dispatch) => {
                return dispatch({
                    type: UPDATE_PROJECT,
                    project: project.updateName(getProperty(json, 'name'))
                });
            },
            (message) => (projectActionError(
                'Error updating project', message
            )),
            requestProjectAction
        )
    );
}


/**
 * Update the resource that is shown on the project page. This function is for
 * example used when changing the output of a notebook cell which modifies the
 * notebook resource.
 */
export const updateResource = (resource) => ({
    type: UPDATE_RESOURCE,
    resource
})


/**
 * Set the workflow handle and page content in the global state to the given
 * values. This funcion is used when the underlying workflow was updated either
 * in notebook view or in spreadsheet view.
 */
export const updateWorkflowResource = (workflow, resource) => ({
    type: UPDATE_WORKFLOW,
    workflow,
    resource
})


// -----------------------------------------------------------------------------
// Errors
// -----------------------------------------------------------------------------

/**
 * Dismiss any project action error message that may be shown by setting the
 * respective property in the global state to null.
 */
export const dismissProjectActionError = (title, message) => ({
     type: PROJECT_ACTION_ERROR,
     error: null
})

/**
 * Error while fetching a project resource, creating a new project branch,
 * or updating the project name.
 */
export const projectActionError = (title, message) => ({
    type: PROJECT_ACTION_ERROR,
    error: new ErrorObject(title, message)
})


/**
 * Error generated while fetching a project.
 */
export const projectFetchError = (message, status) => ({
    type: PROJECT_FETCH_ERROR,
    error: new ErrorObject('Error fetching project', message, status)
})


// -----------------------------------------------------------------------------
// Busy flags
// -----------------------------------------------------------------------------

/**
 * Signal start of fetching a single project.
 */
export const requestProject = () => ({
  type: REQUEST_PROJECT
})

/**
 * Signal start of an action that fetces or manipulates a project property or
 * resource.
 */
export const requestProjectAction = () => ({
  type: REQUEST_PROJECT_ACTION
})
