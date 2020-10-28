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
import '../../../../css/App.css'
import '../../../../css/Notebook.css'
import '../../../../css/Spreadsheet.css'

import styled from 'styled-components';
import { Loader } from 'semantic-ui-react'
import {
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis,
    BarChart,
    Bar,
    Legend,
  } from 'recharts';
const Centered = styled.div`
  text-align: center;
`;

/**
 *Plots are created using Recharts which is a redefined chart library built with React and D3.
 */

class D3BasedPlot extends React.Component {

    render() {
        const { column, profiledData, isLoadingPlot } = this.props;
        // Grid header
        let dataPlot = undefined; // [{}];
        for (let property of profiledData.columns){
            if (property.column.id === column.id){
                dataPlot= property;
                break;
            }
        }
        return (
            <div>
            {
                dataPlot
                ?
                <Centered>
                    <BarChart
                        width={250}
                        height={180}
                        data={dataPlot.values}
                    >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="steelblue" />
                    </BarChart>
                </Centered>
                :
                isLoadingPlot
                ?
                <Loader active inline='centered'  content='Loading'  />
                :
                <p/>
            }
            </div>
        );
    }
}

export default D3BasedPlot;

// TODO: Support other type of data like text. Currently, just bar plots are generated for numerical data types.
/* <ColumnDistributionPlot
    data={columnDataInfo}
    showXLabel={false}
    showYLabel={false}
    showInfo={false}
/> */