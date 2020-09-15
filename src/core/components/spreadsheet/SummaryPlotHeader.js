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
import PropTypes from 'prop-types'
import HeaderCell from './grid/HeaderCell';
import RowIndexCell from './grid/RowIndexCell';
import '../../../css/App.css'
import '../../../css/Notebook.css'
import '../../../css/Spreadsheet.css'
import { profile } from './StatisticsUtils';

/**
 * Display a dataset in spreadsheet format with minimal functionality for the
 * user to interact with the data. This is a static view on a historic
 * dataset that was generated as output of a workflow module.
 */
class SummaryPlotHeader extends React.Component {
    static propTypes = {
        dataset: PropTypes.object.isRequired,
    }

    render() {
        const { dataset } = this.props;
        const profiledData = (dataset.properties == null || Object.keys(dataset.properties).length === 0) ? profile (dataset) : dataset.properties;
        const columns = dataset.columns;
        // Grid header
        let header = [<RowIndexCell key={-1} value=' ' />];
        for (let cidx = 0; cidx < columns.length; cidx++) {
            const column = columns[cidx];
            let dataPlot_ = [{}];
            for (let property of profiledData.columns){
                if (property.column.id === column.id){
                    dataPlot_= property;
                    break;
                }
            }
            header.push(
                <HeaderCell
                    key={column.id}
                    column={column}
                    columnIndex={cidx}
                    dataPlot={dataPlot_}
                />
            );
        }
        header = (<tr>{header}</tr>);
        return (
           <thead>{header}</thead>
        );
    }
}

export default SummaryPlotHeader;
