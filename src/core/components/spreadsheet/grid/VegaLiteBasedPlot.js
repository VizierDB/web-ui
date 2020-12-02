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
import { VegaLite } from 'react-vega';
import '../../../../css/App.css'
import '../../../../css/Notebook.css'
import '../../../../css/Spreadsheet.css'

import styled from 'styled-components';
import { Loader } from 'semantic-ui-react'

const Centered = styled.div`
  text-align: center;
`;

/**
 *Plots are created using Recharts which is a redefined chart library built with React and D3.
 */

function getEncoding(typePlot) {
    const yContent = {
      field: 'count',
      type: 'quantitative',
      title: null,
    };
    if (typePlot === 'histogram_numerical') {
      return {
        y: yContent,
        x: {
          title: null,
          bin: { binned: true },
          field: 'bin_start',
          type: 'quantitative',
        },
        x2: {
          field: 'bin_end',
        },
        tooltip: [
          { field: 'bin_start', title: 'start', type: 'quantitative' },
          { field: 'bin_end', title: 'end', type: 'quantitative' },
        ],
      };
    } else if (typePlot === 'histogram_temporal') {
      return {
        y: yContent,
        x: {
          title: null,
          bin: { binned: true },
          field: 'date_start',
          type: 'temporal',
          utc: true,
        },
        x2: {
          field: 'date_end',
        },
        tooltip: [
          { field: 'date_start', title: 'start', type: 'temporal' },
          { field: 'date_end', title: 'end', type: 'temporal' },
        ],
      };
    } else if (typePlot === 'histogram_categorical') {
      return {
        y: yContent,
        x: {
          title: null,
          field: 'bin',
          type: 'ordinal',
          sort: { order: 'descending', field: 'count' },
        },
        tooltip: { field: 'bin', type: 'ordinal' },
      };
    } else if (typePlot === 'histogram_text') {
      return {
        y: {
          field: 'bin',
          type: 'ordinal',
          title: null,
        },
        x: {
          title: null,
          field: 'count',
          type: 'quantitative',
          sort: { order: 'descending', field: 'count' },
        },
        tooltip: [
          { field: 'bin', type: 'ordinal' },
          { field: 'count', type: 'quantitative' },
        ],
      };
    } else {
      console.log('Unknown plot type ', typePlot);
      return;
    }
}

function getSpecification(typePlot) {
    const specification = {
        width: '120',
        height: '120',
        data: { name: 'values' },
        config: {
            background: null,
            axis: {
                domainColor: 'darkslategray'
              },
            axisX: {
                labels: false,
                ticks: false
              }
          },
        description: 'A simple bar chart with embedded data.',
        encoding: getEncoding(typePlot),
        mark: 'bar',
    };
    return specification;
}

class VegaLiteBasedPlot extends React.Component {

    render() {
        const { column, profiledData, isLoadingPlot } = this.props;
        // Grid header
        let dataPlot = undefined; // [{}];
        let isTherePlotData = false;
        for (let property of profiledData.columns){
            if (property.name === column.name){
                dataPlot= property.plot;
                isTherePlotData = true;
                break;
            }
        }
        const message = <p className="small text-muted"
            style={{textAlign:"center", verticalAlign: "middle", display: "table-cell"}}>
                Nothing to show.
            </p>;

        return (
            <div>
            {
                dataPlot
                ?
                <VegaLite
                    spec={getSpecification(dataPlot.type)}
                    data={{ values: dataPlot.data }}
                />
                :
                isLoadingPlot && !isTherePlotData
                ?
                <Loader active inline='centered'  content='Loading'  />
                :
                <div style={{width:100, height:145, display: "table"}} >
                {message}
                </div>
            }
            </div>
        );
    }
}

export default VegaLiteBasedPlot;

// TODO: Support other type of data like text. Currently, just bar plots are generated for numerical data types.
/* <ColumnDistributionPlot
    data={columnDataInfo}
    showXLabel={false}
    showYLabel={false}
    showInfo={false}
/> */