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
    projectActionError, requestProjectAction, updateResource
} from '../project/Project';
import { ChartResource } from '../../util/App';
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
