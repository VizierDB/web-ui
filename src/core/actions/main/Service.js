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
export const REQUEST_AUTH = 'REQUEST_AUTH'
export const RECEIVE_AUTH = 'RECEIVE_AUTH'

//MODAL IDENTIFIERS
export const MODAL_AUTH = 'AUTH'

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
    properties: json.defaults,
    environment: json.environment,
    links: json.links
})

/**
 * Error handler for service descriptor retrieval.
 */
export const serviceError = (error) => ({
    type: SERVICE_ERROR,
    error
})

/**
 * Signal start of auth request.
 */
export const requestAuth = () => ({
  type: REQUEST_AUTH
})

/**
 * Handler for successful retrieval of auth.
 */
export const receiveAuth = (json) => ({
  type: RECEIVE_AUTH,
  authdata: json
})

/**
 * try to get the auth data saved in local storage.
 */
export const authHeader = (dispatch) => {
    // return authorization header with basic auth credentials
    let user = JSON.parse(localStorage.getItem('user'));
    if(!user){
    	dispatch(requestAuth())
    	return null;
    }
    if (user && user.authdata) {
        return { 'Authorization': 'Basic ' + user.authdata };
    } else {
    	localStorage.removeItem('user')
    	return null;
    }
}

/**
 * try to get the auth data saved in local storage.
 */
export const fetchAuthed = (url, fetchProps) => (dispatch) => {
    const authHead = authHeader(dispatch);
    if(authHead){
	    let newFetchProps = fetchProps;
	    if(fetchProps && fetchProps.headers){
	    	Object.assign(newFetchProps.headers, authHead);
		}
		else if(fetchProps){
			newFetchProps.headers = authHead;
		}
		else {
			newFetchProps = {
				method : 'GET',
				headers: authHead
			};
		}
	    return fetch(url, newFetchProps)
    }
    else return new Promise(function(resolve, reject){
    	 reject({message:"No saved credentials.  Please enter credentials."})
    	})
}

/**
 * Action to retrieve API service descriptor. Expects that the Web Service Url
 * has been set during App initialization.
 *
 */
export const fetchService = () => (dispatch, getState) =>  {
    // Get API Url from the current state. It is expected that the Url has been
    // set as part of the App initialization
    const url = getState().serviceApi.serviceUrl;
    // Signal start to service descriptor retrieval
    dispatch(requestService())
    return fetchAuthed(url)(dispatch)
    // Check the response. Assume that eveything is all right if status
    // code below 400
    .then(function(response) {
        if (response.status >= 200 && response.status < 400) {
            // SUCCESS: Pass the JSON result to the respective callback
            // handler
            response.json().then(json => dispatch(receiveService(json)));
        } else if(response.status === 401) {
        	// UNAUTHORIZED: re-request auth
        	dispatch(requestAuth())
        } else {
            // ERROR: The API is expected to return a JSON object in case
            // of an error that contains an error message
            response.json().then(json => dispatch(serviceError(json.message)));
        }
    })
    .catch(err => dispatch(serviceError(err.message)))
}
