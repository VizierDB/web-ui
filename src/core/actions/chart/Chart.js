import {
    projectActionError, requestProjectAction, updateResource
} from '../project/ProjectPage';
import { ChartResource } from '../../resources/Project';
import { fetchResource } from '../../util/Api';

/**
 * Load a chart view from the Web API. On success, update the content of the
 * project page to show the loaded chart.
 *
 * Parameters:
 *
 * chart: ChartDescriptor
 *
 */
export const showChartView = (chart) => (dispatch) => {
    dispatch(
        fetchResource(
            // Url
            chart.links.self,
            // Success handler
            (json) => {
                return dispatch(
                    updateResource(new ChartResource(chart.name, json))
                );
            },
            // Error handler
            (message) => (projectActionError(
                'Error loading dataset chart view', message
            )),
            // Set busy flag
            requestProjectAction
        )
    )
}
