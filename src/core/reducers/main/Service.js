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
	MODAL_AUTH, REQUEST_SERVICE, RECEIVE_SERVICE, SERVICE_ERROR, REQUEST_AUTH, RECEIVE_AUTH
} from '../../actions/main/Service'
import { HATEOASReferences } from '../../util/HATEOAS'

/**
* Reducer for actions that retrieve the Vizier DB Web Service API descriptor.
*/

/**
 * STATE:
 *
 * error: Error while fetching service descriptor
 * isFetchig: Flag indicating whether fetching is in progress
 * name: Service name
 * properties: List of service properties (e.g., max. upload file size)
 * envs: List of execution environments [{id, name, description}]
 * links: List of HATEOAS references [{rel, href}]
 */

export const serviceApi = (state = {}, action) => {
	switch (action.type) {
    	case REQUEST_SERVICE:
	        return {
	          ...state,
	          isFetching: true
	        }
	    case RECEIVE_SERVICE:
	        return {
	          ...state,
	          isFetching: false,
	          name: action.name,
	          properties: action.properties,
	          envs: action.envs,
	          links: new HATEOASReferences(action.links),
	          refetch: false
	        }
        case SERVICE_ERROR:
            return {
                ...state,
                isFetching: false,
                error: action.error
            }
        case REQUEST_AUTH:
        	return {...state, showModal: MODAL_AUTH}
        case RECEIVE_AUTH:
        	return {
                ...state,
    	        showModal:null,
                isFetching: false,
                error: null,
                refetch: true
        	}
	    default:
	      return state
  }
}
