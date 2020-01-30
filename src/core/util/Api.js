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

import { fetchAuthed, checkResponseJsonForReAuth, requestAuth } from '../actions/main/Service';


/**
 * Collection of functions to interact with the Vizier DB Web service API.
 */


/**
 * Generic function to create a new resource at the Web service via HTTP POST
 * request. Expects at least two callback functions (successHandler and
 * errorHandler) that will be called respectively when the resource was
 * retrieved successfully or in case of an error. The optional
 * signalStartHandler will be called before the request is being made.
 */
export const createResource = (url, data, successHandler, errorHandler, signalStartHandler) => (dispatch) => {
    dispatch(postResourceData(url, data, successHandler, errorHandler, signalStartHandler))
}


/**
 * Generic function to delete a resource from the Web service. Expects at
 * least two callback functions (successHandler and errorHandler) that will be
 * called respectively when the resource was deleted successfully or in case
 * of an error. The optional signalStartHandler will be called before the
 * attempt to fetch the resource is being made.
 *
 * There are no arguments that are being passed to the success handler because
 * Vizier DB API DELETE requests to not return any content.
 *
 * If the resource does not exists no error will be displayed. Instead, the
 * success handler is called.
 */
export const deleteResource = (url, successHandler, errorHandler, signalStartHandler) => (dispatch) => {
    // Signal start if callback handle is given
    if (signalStartHandler) {
        dispatch(signalStartHandler())
    }
    return fetchAuthed(url, {method: 'DELETE'})(dispatch)
        // Check the response. Assume that eveything is all right if status
        // code is 204
        .then(function(response) {
            if (response.status === 204) {
                // SUCCESS: Pass the JSON result to the respective callback
                // handler
                dispatch(successHandler());
            } else if(response.status === 401) {
            	// UNAUTHORIZED: re-request auth
            	dispatch(requestAuth());
            } else if (response.status === 404) {
                dispatch(errorHandler('Resource not found'));
            } else {
                // ERROR: The API is expected to return a JSON object in case
                // of an error that contains an error message
                checkResponseJsonForReAuth(response).then(json => dispatch(errorHandler(json.message)));
            }
        })
        .catch(err => dispatch(errorHandler(err.message)))
}


/**
 * Generic function to retrieve a resource from the Web service. Expects at
 * least two callback functions (successHandler and errorHandler) that will be
 * called respectively when the resource was retrieved successfully or in case
 * of an error. The optional signalStartHandler will be called before the
 * attempt to fetch the resource is being made.
 */
export const fetchResource = (url, successHandler, errorHandler, signalStartHandler) => (dispatch) => {
    // Signal start if callback handle is given
    if (signalStartHandler) {
        dispatch(signalStartHandler())
    }
    return fetchAuthed(url)(dispatch)
        // Check the response. Assume that eveything is all right if status
        // code below 400
        .then(function(response) {
            if (response.status >= 200 && response.status < 400) {
                // SUCCESS: Pass the JSON result to the respective callback
                // handler
                checkResponseJsonForReAuth(response).then(json => dispatch(successHandler(json)));
            } else if(response.status === 401) {
            	// UNAUTHORIZED: re-request auth
            	dispatch(requestAuth())
            } else {
                // ERROR: The API is expected to return a JSON object in case
                // of an error that contains an error message
                checkResponseJsonForReAuth(response).then(json => dispatch(errorHandler(json.message)));
            }
        })
        .catch(err => dispatch(errorHandler(err.message)))
}


/**
 * Get the value for a resource property with given key. If no property with
 * given key exists the defaultValue will be returned.
 */
export const getProperty = (object, key, defaultValue) => {
    // Get dictionary value for key 'name'
    let property = object.properties.find(prop => (prop.key === key));
    if (property) {
        return property.value;
    } else {
        return defaultValue;
    }
};


/**
 * Generic function to create or update a resource at the Web service via HTTP
 * POST request. Expects at least two callback functions (successHandler and
 * errorHandler) that will be called respectively when the resource was
 * created or updated successfully or in case of an error. The optional
 * signalStartHandler will be called before the request is being made.
 */
export const postResourceData = (url, data, successHandler, errorHandler, signalStartHandler) => (dispatch) => {
    // Signal start if callback handle is given
    if (signalStartHandler) {
        dispatch(signalStartHandler())
    }
    return fetchAuthed(
            url,
            {
                method: 'POST',
                body: JSON.stringify(data),
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
                checkResponseJsonForReAuth(response).then(json => dispatch(successHandler(json)));
            } else if(response.status === 401) {
            	// UNAUTHORIZED: re-request auth
            	dispatch(requestAuth())
            } else {
                // ERROR: The API is expected to return a JSON object in case
                // of an error that contains an error message
                checkResponseJsonForReAuth(response).then(json => dispatch(errorHandler(json.message)));
            }
        })
        .catch(err => dispatch(errorHandler(err.message)))
}


/**
 * Generic function to update a resource at the Web service via HTTP PUT
 * request. Expects at least two callback functions (successHandler and
 * errorHandler) that will be called respectively when the resource was
 * created or updated successfully or in case of an error. The optional
 * signalStartHandler will be called before the request is being made.
 */
export const putResourceData = (dispatch, url, data, successHandler, errorHandler, signalStartHandler) => {
    // Signal start if callback handle is given
    if (signalStartHandler) {
        dispatch(signalStartHandler())
    }
    return fetchAuthed(
            url,
            {
                method: 'PUT',
                body: JSON.stringify(data),
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
                checkResponseJsonForReAuth(response).then(json => dispatch(successHandler(json)));
            } else if(response.status === 401) {
            	// UNAUTHORIZED: re-request auth
            	dispatch(requestAuth())
            } else {
                // ERROR: The API is expected to return a JSON object in case
                // of an error that contains an error message
                checkResponseJsonForReAuth(response).then(json => dispatch(errorHandler(json.message)));
            }
        })
        .catch(err => dispatch(errorHandler(err.message)))
}


/**
 * Generic function to update a property of a resource at the Web service via
 * HTTP POST request. Expects at least two callback functions (successHandler
 * and errorHandler) that will be called respectively when the resource was
 * updated successfully or in case of an error. The optional signalStartHandler
 * will be called before the request is being made.
 *
 * The property key cannot be null. If the new property value is null, the
 * property will be deleted.
 */
 export const updateResourceProperty = (url, key, value, successHandler, errorHandler, signalStartHandler) => (dispatch) => {
    let updStmt = {'key': key}
    if (value !== null) {
        updStmt['value'] = value
    }
    return putResourceData(dispatch, url, {'properties': [updStmt]}, successHandler, errorHandler, signalStartHandler)
}


/**
 * Update a resource at the Vizier DB Web API by posting a Json object. Expects
 * at least two callback functions (successHandler and errorHandler) that will
 * be called respectively when the resource was updated successfully or in case
 * of an error. The optional signalStartHandler will be called before the
 * request is being made.
 */
export const updateResource = (url, data, successHandler, errorHandler, signalStartHandler) => (dispatch) => {
    return postResourceData(dispatch, url, data, successHandler, errorHandler, signalStartHandler)
}
