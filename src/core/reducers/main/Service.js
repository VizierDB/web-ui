/**
 * Reducer for actions that retrieve the Vizier DB Web Service API descriptor.
 */

import {
  REQUEST_SERVICE, RECEIVE_SERVICE, SERVICE_ERROR
} from '../../actions/main/Service'
import { HATEOASReferences } from '../../util/Api'

/**
 * STATE:
 *
 * error: Error while fetching service descriptor
 * isFetchig: Flag indicating whether fetching is in progress
 * name: Service name
 * engines: List of service engines [{id, name, description}]
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
              engines: action.engines,
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
