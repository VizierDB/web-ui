/**
 * Actions for retrieving the Vizier DB Web Service Descriptor. The service
 * descriptor contains the service name, the list of available workflow
 * execution environments, and a list of HATEOAS references to Web service
 * resources.
 *
 * The service descriptor will be retrieved as the first operation by the Web
 * Application.
 *
 * The service descriptor will be maintained as part of the application state
 * under element 'serviceApi'.
 *
 * It is assumed that the serviceUrl (containing the base Url of the Vizier DB
 * Web Service) has been initialized as path of the App initialization.
 */

export const REQUEST_SERVICE = 'REQUEST_SERVICE'
export const RECEIVE_SERVICE = 'RECEIVE_SERVICE'
export const SERVICE_ERROR = 'SERVICE_ERROR'

/**
 * Signal start of service descriptor fetching.
 */
const requestService = () => ({
  type: REQUEST_SERVICE
})

/**
 * Handler for successful retrieval of service descriptor.
 */
const receiveService = (json) => ({
  type: RECEIVE_SERVICE,
  name: json.name,
  properties: json.properties,
  envs: json.envs,
  links: json.links
})

/**
 * Error handler for service descriptor retrieval.
 */
const serviceError = (error) => ({
    type: SERVICE_ERROR,
    error
})

/**
 * Action to retrieve API service descriptor. Expects that the Web Service Url
 * has been set during App initialization.
 *
 */
export const fetchService = () => (dispatch, getState) => {
    // Get API Url from the current state. It is expected that the Url has been
    // set as part of the App initialization
    const url = getState().serviceApi.serviceUrl;
    // Signal start to service descriptor retrieval
    dispatch(requestService())
    return fetch(url)
    // Check the response. Assume that eveything is all right if status
    // code below 400
    .then(function(response) {
        if (response.status >= 200 && response.status < 400) {
            // SUCCESS: Pass the JSON result to the respective callback
            // handler
            response.json().then(json => dispatch(receiveService(json)));
        } else {
            // ERROR: The API is expected to return a JSON object in case
            // of an error that contains an error message
            response.json().then(json => dispatch(serviceError(json.message)));
        }
    })
    .catch(err => dispatch(serviceError(err.message)))
}
