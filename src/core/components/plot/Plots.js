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
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types'

import {scaleOrdinal} from 'd3-scale';
import { AreaChart, BarChart, LineChart, ScatterPlot } from 'react-d3-components';
import { GridList, GridTile} from 'material-ui/GridList';
import { Checkbox, Dropdown } from 'semantic-ui-react';
import '../../../css/Chart.css'


class Plots extends React.Component {

    static propTypes = {
        dataset: PropTypes.object.isRequired
    }

    constructor(props){
        super(props);
        const { dataset } = props;
        // Set grouped to true if only one data series is given (in this case
        // the grouped checkbox is hidden) and grouped layout should be
        // default.
        this.state = {
            chartType: dataset.chart.type,
            grouped: (dataset.chart.grouped || (dataset.series.length === 1)),
            width: 400
        };
        // Get list of series labels and set global color scale
        this.labels = [];
        for (let i = 0; i < dataset.series.length; i++) {
            this.labels.push(dataset.series[i].label)
        }
        this.colorScale = scaleOrdinal()
            .domain(this.labels)
            .range([
                "#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#d62728",
                "#d62728", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2",
                "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf",
                "#9edae5"
            ]);
    }
    /**
     * Add event handler to keep track of the container width.
     */
    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
    }
    /**
     * Keep track of the elements width to adjust charts on resize.
     */
    handleResize = (e) => {
        // This seems to fail in some situations.
        try {
            let elem = ReactDOM.findDOMNode(this);
            this.setState({
                width: elem.offsetWidth
            });
        } catch (err) {
        }
    }
    /**
     * Handle selection of a chart type.
     */
    handleSelectChart = (event, { value }) => {
        this.setState({'chartType': value});
    }
    /**
     * Handle change of the grouped checkbox.
     */
    handleToggleGrouped = (e, { checked }) => {
        this.setState({'grouped': checked});
    }
    //Get legend
    getLegend = (schema) => {
        let legend = [];
        for (let i=0; i<schema.length; i++) {
            const label = schema[i].label;
            legend.push(
                <li
                    key={i}
                    style={{
                        background:this.colorScale(label),
                        width:10,
                        marginTop:5,
                        listStyleType: 'none',
                        whiteSpace: 'nowrap'
                    }}>
                    <span style={{marginLeft:15}}>{label}</span>
                </li>
            );
        }
        return legend;
    }
    /*
     * Load data on the format:
     *   data = [
     *     { label: 'somethingA', values: [{x: 'SomethingA', y: 10}, {x: 'SomethingB', y: 4}, {x: 'SomethingC', y: 3}] },
     *     { label: 'somethingB', values: [{x: 'SomethingA', y: 6}, {x: 'SomethingB', y: 8}, {x: 'SomethingC', y: 5}]  }
     *  ];
     *
     * The format of the dataset object is expected to be:
     * {
     *     "series": [{
     *         "label": "string",
     *         "data": [0]
     *     }],
     *     "xAxis": {
     *         "data": [0]
     *    }
     * }
     */
    loadData(dataset) {
        // Check if a data series for x-axis is given. If not we use 1-n as
        // x-axis labels.
        let xAxis = null;
        if (dataset.xAxis !== undefined) {
            xAxis = dataset.xAxis.data;
        } else {
            xAxis = [];
            for (let i = 0; i < dataset.series[0].data.length; i++) {
                xAxis.push(i + 1);
            }
        }
        let total_data = [];
        for (let i=0; i<dataset.series.length; i++) {
            const series = dataset.series[i];
            let data_i = {};
            data_i['label'] = series.label;
            let values = [];
            for (let j=0; j<series.data.length; j++){
                let index = {};
                let xLabel = xAxis[j];
                if (xLabel === null) {
                    xLabel = j;
                }
                index['x'] = xLabel.toString();
                index['y'] = series.data[j];
                values.push(index);
            }
            let sort_values = values.sort(function(a, b){return a.x - b.x});
            data_i['values'] = sort_values;
            total_data.push(data_i);
        }
        return total_data;
    }
    /**
     * Render a single chart or a GridList of charts (if grouped is true).
     */
    selectedCharts = (nameChart, data, grouped, width) => {
        // Get function to plot chart of specified type. The result is undefined
        // if the chartName is unknown.
        const chart = this.selectedChart(nameChart);
        if (chart === undefined) {
            return null;
        }
        if (grouped) {
            // If grouped we just plot one chart with the all the data series
            return chart(data, width);
        } else {
            // Display a flex grids of individual charts for each data series.
            const charts = [];
            for (let i=0; i<data.length; i++) {
                let data_ = [];
                data_.push(data[i]);
                charts.push(<GridTile key={i}>{chart(data_, 400)}</GridTile>);
            }
            return <GridList
                    cellHeight={this.props.gridList_cellHeight}
                    cols={Math.floor(width / 400)}
                    style={{width: {width}, height: this.props.gridList_height, overflowY: this.props.gridLis_overflowY,}}>
                    {charts}
                </GridList>;
        }
    }
    /**
     * Return a function that takes a list of data series and width as parameter
     * and renders a chart of the type that is specified in chartName.
     */
    selectedChart = (nameChart) => {
        if (nameChart === 'Area Chart') { // area chart
            return (data, width) => (
                <AreaChart
                    data={data}
                    colorScale={this.colorScale}
                    width={width}
                    height={400}
                    margin={{top: 10, bottom: 50, left: 50, right: 10}}
                />
            );
        } else if (nameChart==='Bar Chart') { // bar chart
            return (data, width) => (
                <BarChart
                    groupedBars
                    data={data}
                    colorScale={this.colorScale}
                    width={width}
                    height={400}
                    margin={{top: 10, bottom: 50, left: 50, right: 10}}
                />
            );
        } else if (nameChart==='Line Chart') { // line chart
            return (data, width, colorScale) => (
                <LineChart
                    data={data}
                    colorScale={this.colorScale}
                    width={width}
                    height={400}
                    margin={{top: 10, bottom: 50, left: 50, right: 10}}
                />
            );
        } else if (nameChart==='Scatter Plot') { // scatter plot
            return (data, width, colorScale) => (
                <ScatterPlot
                    data={data}
                    colorScale={colorScale}
                    width={width}
                    height={400}
                    margin={{top: 10, bottom: 50, left: 50, right: 10}}
                />
            );
        }
    }
    render() {

        const { dataset } = this.props;
        // Return null if the dataset is empty
        if (dataset.series.length === 0) {
            return null;
        }
        const { chartType, grouped, width } = this.state;
        var data = this.loadData(dataset);
        var chart = this.selectedCharts(chartType, data, grouped, width);
        var legend =this.getLegend(dataset.series);

        const options = [];
        for (let i = 0; i < this.props.charts.length; i++) {
          options.push({
              key: i,
              text: this.props.charts[i],
              value: this.props.charts[i]
          })
        }
        // Show a 'grouped' checkbox if the dataset has more than one data
        // series.
        let groupedCheckbox = null;
        if (dataset.series.length > 1) {
            groupedCheckbox = (
                <td className='plot-form-check'>
                    <Checkbox
                        checked={grouped}
                        label='Grouped'
                        onChange={this.handleToggleGrouped}
                    />
                </td>
            );
        }
        return (
            <div>
                <div className='plot-menu'>
                    <table className='plot-form-table'><tbody><tr>
                        <td className='plot-form-label'>{"Charts"}</td>
                        <td className='plot-form-dropdown'>
                            <Dropdown
                                text={chartType}
                                selection
                                fluid
                                scrolling
                                options={options}
                                onChange={this.handleSelectChart}
                            />
                        </td>
                        { groupedCheckbox }
                    </tr></tbody></table>
                </div>
                  <div id="plot" className='plot-view'>
                  <ul className='plot-legend'>
                      {legend}
                  </ul>
                  <div>
                      {chart}
                  </div>
                </div>
            </div>
        );
    }
}

Plots.defaultProps = {
    x:0,
    y:0,
    gridList_cellHeight:400,
    gridList_width:1000,
    gridList_height:450,
    gridLis_overflowY:'auto',
    colorText:'black',
    charts : ["Area Chart", "Bar Chart", "Line Chart", "Scatter Plot"],
};
/*<p>Got data for {this.props.rows.length} row(s) and {this.props.schema.series.length} data series</p>*/


export default Plots
