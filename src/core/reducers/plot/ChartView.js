/**
* Reducer for dataset chart view.
*/

import {
    CHARTVIEW_FETCH_ERROR, CHARTVIEW_FETCH_START, CHARTVIEW_FETCH_SUCCESS
} from '../../actions/plot/ChartView'


/**
 * STATE:
 *
 * data: Chart view data. The expected format is:
 * {
 *   "name": "string",
 *   "data": [[ list of rows ]],
 *   "schema": {
 *     "series": [{
 *       "label": "string",
 *       "index": 0 <- Index of series data in the data row array
 *     }],
 *     "xAxis": 0 <- Index of series for x-axis labels in the data row array
 *   },
 *   "links": [{
 *     "rel": "string",
 *     "href": "string"
 *   }]
 * }
 * error: Error while fetching chart view data
 * isBusy: Flag indicating whether fetching is in progress
 */

const INITIAL_STATE = {
    data: null,
    error: null,
    isBusy: false,
}

export const chartView = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case CHARTVIEW_FETCH_START:
            return {
                ...state,
                data: null,
                error: null,
                isBusy: true
            }
        case CHARTVIEW_FETCH_ERROR:
            return {
                ...state,
                error: action.error,
                isBusy: false
            }
        case CHARTVIEW_FETCH_SUCCESS:
            return {
                ...state,
                data: action.data,
                error: null,
                isBusy: false
            }
        default:
            return state
    }
}
