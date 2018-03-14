export const CHARTVIEW_FETCH_ERROR = 'CHARTVIEW_FETCH_ERROR'
export const CHARTVIEW_FETCH_START = 'CHARTVIEW_FETCH_START'
export const CHARTVIEW_FETCH_SUCCESS = 'CHARTVIEW_FETCH_SUCCESS'

/**
 * Fetch metadata and content for a given dataset chart view.
 */
export const fetchChartView = (url) => (dispatch) => {
    // Signal start of data fetching
    dispatch(requestChartView())
    return fetch(url)
    // Check the response. Assume that eveything is all right if status
    // code below 400
    .then(function(response) {
        if (response.status >= 200 && response.status < 400) {
            // SUCCESS: Pass the JSON result to the respective callback
            // handler
            response.json().then(json => {
                dispatch(receiveChartView(json))
            });
        } else {
            // ERROR: The API is expected to return a JSON object in case
            // of an error that contains an error message
            response.json().then(json => dispatch(chartViewFetchError(json.message)));
        }
    })
    .catch(err => dispatch(chartViewFetchError(err.message)))
}

/**
 * Received chart view data.
 */
export const receiveChartView = (data) => ({
    type: CHARTVIEW_FETCH_SUCCESS,
    data
})

/**
 * Set busy flag during chart view fetch. Should also invalidate the current
 * chart view.
 */
export const requestChartView = () => ({
    type: CHARTVIEW_FETCH_START
})

/**
 * Signal error while fetching a dataset chart view
 */
export const chartViewFetchError = (message) => ({
    type: CHARTVIEW_FETCH_ERROR,
    error: {
        title: 'Error while fetching data',
        message
    }
})
