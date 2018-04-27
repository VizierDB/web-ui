/**
 * Reducer for actions that retrieve the Vizier DB Web Service API descriptor.
 */

import {
  REQUEST_SERVICE, RECEIVE_SERVICE, SERVICE_ERROR
} from '../../actions/main/Service'
import { HATEOASReferences } from '../../util/HATEOAS'

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
              links: new HATEOASReferences(action.links)
            }
        case SERVICE_ERROR:
            return {
              ...state,
              isFetching: false,
              error: action.error
            }
    default:
      return state
  }
}
