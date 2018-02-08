/**
 * Actions to access and manipulate file server resources.
 */
import { deleteResource, updateResource } from '../../util/Api'

export const REQUEST_FILES = 'REQUEST_FILES'
export const RECEIVE_FILES = 'RECEIVE_FILES'
export const SET_FILE_DELETE_ERROR = 'SET_FILE_DELETE_ERROR'
export const SET_FILE_UPDATE_ERROR = 'SET_FILE_UPDATE_ERROR'
export const SET_FILE_UPLOAD_ERROR = 'SET_FILE_UPLOAD_ERROR'
export const SET_FILES_FETCH_ERROR = 'SET_FILES_FETCH_ERROR'
export const START_UPLOAD = 'START_UPLOAD'

/**
 * Send DELETE request for file with given Url
 */
export const deleteFile = (url) => (dispatch) => {
    dispatch(deleteResource(url, fetchFiles, fileDeleteError, requestFiles))
}

/**
 * Action to retrieve file listing. Expects that the service Api has been set
 * during App initialization.
 *
 */
export const fetchFiles = () => (dispatch, getState) => {
    // Get file server Url from the API reference set. This set may not have
    // been initialized yet!
    if (getState().serviceApi.links) {
        const url = getState().serviceApi.links.files;
        // Signal start of fetching file listing
        dispatch(requestFiles())
        return fetch(url)
        // Check the response. Assume that eveything is all right if status
        // code below 400
        .then(function(response) {
            if (response.status >= 200 && response.status < 400) {
                // SUCCESS: Pass the JSON result to the respective callback
                // handler
                response.json().then(json => dispatch(receiveFiles(json)));
            } else {
                // ERROR: The API is expected to return a JSON object in case
                // of an error that contains an error message
                response.json().then(json => dispatch(filesFetchError(json.message)));
            }
        })
        .catch(err => dispatch(filesFetchError(err.message)))
    } else {
        dispatch(receiveFiles({files: [], links: []}))
    }
}

/**
 * Handle errors when deleting a file.
 */
export const fileDeleteError = (error) => ({
    type: SET_FILE_DELETE_ERROR,
    error
})

/**
 * Error during file upload
 */
export const fileUpdateError = (error) => ({
    type: SET_FILE_UPDATE_ERROR,
    error
})

/**
 * Handle errors when retrieving the file listing.
 */
const filesFetchError = (error) => ({
    type: SET_FILES_FETCH_ERROR,
    error
})

/**
 * Signal start of file listing fetch.
 */
const requestFiles = () => ({
  type: REQUEST_FILES
})

/**
 * Handler for successful retrieval of file listing.
 */
export const receiveFiles = (json) => ({
    type: RECEIVE_FILES,
    files: json.files,
    links: json.links
})

/**
 * Signal start of file upload
 */
const startUpload = () => ({
    type: START_UPLOAD
})

/**
 * Submit update filename request.
 */
export const updateFileName = (url, filename) => (dispatch) => {
    dispatch(updateResource(url, {'name': filename}, fetchFiles, fileUpdateError, requestFiles))
}

/**
 * Error during file upload
 */
export const uploadError = (error) => ({
    type: SET_FILE_UPLOAD_ERROR,
    error
})

/**
 * Upload a given file. Refresh file listing if successful.
 */
export const uploadFile = (url, file) => (dispatch) => {
    dispatch(startUpload())
    let data = new FormData();
    data.append('file', file);
    console.log('READY TO GO')
    return fetch(
            url,
            {
                method: 'POST',
                body: data
            }
        )
        // Check the response. Assume that eveything is all right if status
        // code below 400
        .then(function(response) {
            console.log('GOT DATA')
            if (response.status >= 200 && response.status < 400) {
                console.log('UPLOAD SUCCESS')
                // SUCCESS: Fetch updated file listing
                response.json().then(json => dispatch(fetchFiles()));
            } else {
                // ERROR: The API is expected to return a JSON object in case
                // of an error that contains an error message. For some response
                // codes, however, this is not true (e.g. 413).
                // TODO: Catch the cases where there is no Json response
                if (response.status === 413) {
                    dispatch(uploadError('HTTP 413 Payload Too Large'))
                } else {
                    console.log('UPLOAD ERROR')
                    response.json().then(json => dispatch(uploadError(json.message)));
                }
            }
        })
        .catch(err => dispatch(uploadError(err.message)))
}
