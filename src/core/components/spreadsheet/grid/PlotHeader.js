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

import React from 'react'
import '../../../../css/App.css'
import '../../../../css/Notebook.css'
import '../../../../css/Spreadsheet.css'
import D3BasedPlot from './D3BasedPlot';
import VegaLiteBasedPlot from './VegaLiteBasedPlot';
/**
 * The plot header is generated based on the type of profiler.
 */
class PlotHeader extends React.Component {
    render() {
        const { column, profiledData, isLoadingPlot } = this.props;
        const profilerType = profiledData.is_profiled[0];
        if (profilerType === 'mimir'){
            return (
                <D3BasedPlot
                    column={column}
                    profiledData={profiledData}
                    isLoadingPlot={isLoadingPlot}
                />
            );
        }
        if (profilerType === 'datamart_profiler') {
            return (
                <VegaLiteBasedPlot
                    column={column}
                    profiledData={profiledData}
                    isLoadingPlot={isLoadingPlot}
                />
            );
        }
    }
}

export default PlotHeader;