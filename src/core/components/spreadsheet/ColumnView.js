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
import { profile } from './StatisticsUtils';

import {
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import styled from 'styled-components';
const Centered = styled.div`
text-align: center;
`;

/**
 * Display a dataset in spreadsheet format with minimal functionality for the
 * user to interact with the data. This is a static view on a historic
 * dataset that was generated as output of a workflow module.
 */
class ColumnView extends React.Component {
    static propTypes = {
        dataset: PropTypes.object.isRequired,
    }
    
    render() {
        const { dataset} = this.props;

        const profiledData = profile (dataset);

        const columns = dataset.columns;
        // Grid header
        let header = [<RowIndexCell key={-1} value=' ' />];
        for (let cidx = 0; cidx < columns.length; cidx++) {
            const column = columns[cidx];
            const dataPlot_ = profiledData != null 
                                ? profiledData.find( item => {
                                    return item.column.id === column.id;
                                })
                                :
                                [{}];

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
                    <Centered>
                        <BarChart
                            width={250}
                            height={180}
                            data={dataPlot_.values}
                        >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="steelblue" />
                        </BarChart>
                    </Centered>
                    </div>
                  </td>
                  <td key={'rows_' + column.name} style={{width: '35%'}}>
                    {
                      column.type === 'varchar' || column.type === 'categorical' || column.type === 'boolean'
                      ?
                      <div className="row">
                        <ul style={{ listStyle: 'none', columnCount: 2, columnGap: 10 }}>
                          {dataPlot_.values.length && <li>Unique Values</li>}
                          {dataPlot_.values.length && <li>Most Common</li>}

                          {dataPlot_.values.length && (
                            <li>{dataPlot_.values.length}</li>
                          )}
                          {dataPlot_.values.length && (
                            <li>{}</li>
                          )}
                        </ul>
                      </div>
                      :
                      dataPlot_.stats ?
                      <div className="row">
                        <ul style={{ listStyle: 'none', columnCount: 2, columnGap: 10 }}>
                          {dataPlot_.stats.max && <li>Maximun</li>}
                          {dataPlot_.stats.min && <li>Minimun</li>}
                          {dataPlot_.stats.mean && <li>Mean</li>}
                          {dataPlot_.stats.stdDev && <li>Std Deviation</li>}

                          {dataPlot_.stats.max && (
                            <li>{dataPlot_.stats.max}</li>
                          )}
                          {dataPlot_.stats.min && (
                            <li>{dataPlot_.stats.min}</li>
                          )}
                          {dataPlot_.stats.mean && (
                            <li>{dataPlot_.stats.mean.toFixed(2)}</li>
                          )}
                          {dataPlot_.stats.stdDev && (
                            <li>{dataPlot_.stats.stdDev.toFixed(2)}</li>
                          )}
                        </ul>
                        {/* <div className="col-xs-6">
                          <ul style={{listStyle: 'none'}}>
                            <li><span>Maximun</span></li>
                            <li><span>Minimun </span></li>
                            <li><span>Mean </span></li>
                            <li><span>Std. Deviation </span></li>
                          </ul>
                        </div>
                        <div className="col-xs-6" style={{textAlign: 'right'}}>
                          <ul style={{listStyle: 'none'}}>
                            <li><span>{ dataPlot_.stats.max}</span></li>
                            <li><span>{ dataPlot_.stats.min}</span></li>
                            <li><span>{dataPlot_.stats.mean != null ?
                            dataPlot_.stats.mean.toFixed(2) : null}</span></li>
                            <li><span>{ dataPlot_.stats.stdDev != null ?
                            dataPlot_.stats.stdDev.toFixed(2) : null}</span></li>
                          </ul>
                        </div> */}
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
}

export default ColumnView;
