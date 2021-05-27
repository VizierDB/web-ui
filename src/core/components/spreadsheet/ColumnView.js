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
import RowIndexCell from './grid/RowIndexCell';
import '../../../css/App.css'
import '../../../css/Notebook.css'
import '../../../css/Spreadsheet.css'
import { Table} from 'react-bootstrap';
import PlotHeader from './grid/PlotHeader';

/**
 * Display a dataset in spreadsheet format with minimal functionality for the
 * user to interact with the data. This is a static view on a historic
 * dataset that was generated as output of a workflow module.
 */
ColumnView.propTypes = {
    dataset: PropTypes.object.isRequired
}

export default function ColumnView(props){
    const { dataset } = props;
    const profiledData = dataset.properties;
    const columns = dataset.columns;
    const profilerType = profiledData.is_profiled[0];
    // Grid header
    let header = [<RowIndexCell key={-1} value=' ' />];
    for (let cidx = 0; cidx < columns.length; cidx++) {
        const column = columns[cidx];
        let dataPlot_ = [{}];

        for (let property of profiledData.columns){
            if (profilerType === 'mimir' && property.column.id === column.id){
                dataPlot_= property;
                break;
            }
            if (profilerType === 'datamart_profiler' && property.name === column.name){
                dataPlot_= property;
                break;
            }
        }
        header.push(
            <tr key={'rowse_' + column.id}>
                <td key={'rows_' + column.name} style={{width: '20%'}}>
                    <h4> { column.name } </h4>
                </td>
                <td key={'rows_cf' + column.name} style={{width: '15%'}}>
                    <button
                        className="btn btn-secondary float-right"
                        disabled={true}
                        style={{ backgroundColor: '#e3e3e3', borderColor: '#cfcfcf', borderRadius: '4px'}}
                    >
                        { column.type }
                    </button>
                </td>
                <td key={column.name} style={{width: '30%'}}>
                    <div className="card mb-4" style={{overflow: 'auto'}}>
                    {
                        dataset && dataset.isProfiled() &&
                        <PlotHeader
                            column={column}
                            profiledData={profiledData}
                            isLoadingPlot={true}
                        />
                    }
                    </div>
                </td>
                <td key={'rows_' + column.name} style={{width: '35%'}}>
                    {
                        column.type === 'string' || column.type === 'varchar' || column.type === 'categorical' || column.type === 'boolean'
                            ?
                            <div className="row">
                                <ul style={{ listStyle: 'none', columnCount: 2, columnGap: 10 }}>
                                    {dataPlot_.distinctValueCount != null  && <li>Unique Values</li>}
                                    {dataPlot_.num_distinct_values != null  && <li>Unique Values</li>}
                                    {dataPlot_.count != null  && <li>Total Values</li>}
                                    {dataPlot_.nullCount != null  && <li>Null Values</li>}
                                    {dataPlot_.distinctValueCount != null  && (<li>{dataPlot_.distinctValueCount}</li>)}
                                    {dataPlot_.num_distinct_values != null  && (<li>{dataPlot_.num_distinct_values}</li>)}
                                    {dataPlot_.count != null  && (<li>{dataPlot_.count}</li>)}
                                    {dataPlot_.nullCount != null  && (<li>{dataPlot_.nullCount}</li>)}
                                </ul>
                            </div>
                            :
                            dataPlot_ ?
                                <div className="row">
                                    <ul style={{ listStyle: 'none', columnCount: 2, columnGap: 10 }}>
                                        {dataPlot_.max != null && <li>Maximum</li>}
                                        {dataPlot_.min != null &&<li>Minimum</li>}
                                        {dataPlot_.mean != null  && <li>Mean</li>}
                                        {dataPlot_.stdDev != null  && <li>Std Deviation</li>}
                                        {dataPlot_.sum != null  && <li>Sum</li>}
                                        {dataPlot_.distinctValueCount != null  && <li>Unique Values</li>}
                                        {dataPlot_.num_distinct_values != null  && <li>Unique Values</li>}
                                        {dataPlot_.count != null  && <li>Total Values</li>}
                                        {dataPlot_.nullCount != null  && <li>Null Values</li>}
                                        {dataPlot_.max != null  && (<li>{dataPlot_.max}</li>)}
                                        {dataPlot_.min != null  && (<li>{dataPlot_.min}</li>)}
                                        {dataPlot_.mean != null  && (<li>{dataPlot_.mean.toFixed(2)}</li>)}
                                        {dataPlot_.stdDev != null  && (<li>{dataPlot_.stdDev.toFixed(2)}</li>)}
                                        {dataPlot_.sum != null  && (<li>{dataPlot_.sum.toFixed(2)}</li>)}
                                        {dataPlot_.distinctValueCount != null  && (<li>{dataPlot_.distinctValueCount}</li>)}
                                        {dataPlot_.num_distinct_values != null  && (<li>{dataPlot_.num_distinct_values}</li>)}
                                        {dataPlot_.count != null  && (<li>{dataPlot_.count}</li>)}
                                        {dataPlot_.nullCount != null  && (<li>{dataPlot_.nullCount}</li>)}
                                    </ul>
                                </div>
                                :
                                <div/>
                    }
                </td>
            </tr>
        );
    }
    header = (<tbody>{header}</tbody>);
    return (
        <div style={{maxHeight: 400, minHeight: 400, overflow: 'auto' }}>
            <Table>
                {header}
            </Table>
        </div>
    );
}
