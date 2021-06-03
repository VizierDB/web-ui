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

import React, { PureComponent }  from 'react'
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types'
import {scaleOrdinal} from 'd3-scale';
// ResponsiveContainer
import {BarChart, LineChart, AreaChart, ScatterChart, PieChart, RadarChart,
    Line, Area, Bar, Scatter, Treemap, Pie, Cell, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, RadialBarChart, RadialBar, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, Brush} from 'recharts';
import { GridList, GridTile} from 'material-ui/GridList';
import { Checkbox, Dropdown } from 'semantic-ui-react';
import '../../../css/Chart.css'

class Plots extends React.Component {

    static propTypes = {
        dataset: PropTypes.object.isRequired,
        identifier: PropTypes.string.isRequired,
        onSelectCell: PropTypes.func
    }

    constructor(props){
        super(props);
        const dataset = props.dataset;
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
        this.listColors = [
            "#1f77b4", "#ff7f0e", "#2ca02c",
            "#d62728", "#c5b0d5", "#c49c94",
            "#f7b6d2", "#c7c7c7", "#dbdb8d",
            "#9edae5", "#aec7e8", "#ffbb78", "#d62728",
            "#9467bd", "#8c564b", "#e377c2",
            "#7f7f7f", "#bcbd22", "#17becf"
        ];
        this.colorScale = scaleOrdinal()
            .domain(this.labels)
            .range(this.listColors);
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

    fetchData(dataset) {
        // Check if a data series for x-axis is given. If not we use 1-n as
        // x-axis labels.
        let xAxisName = 'x';
        let xAxis = null;
        if (dataset.xAxis !== undefined) {
            xAxis = dataset.xAxis.data;
        } else {
            xAxis = [];
            for (let i = 0; i < dataset.series[0].data.length; i++) {
                xAxis.push(i + 1);
            }
        }
        let values = [];
        let global_data = {};
        //let total_data = [];
        let columnsNames = [];
        columnsNames.push(xAxisName);
        for (let j=0; j<dataset.series.length; j++) {
          columnsNames.push(dataset.series[j].label.toString());
        }
        for (let i=0; i<xAxis.length; i++){
            let data_i = {};
            data_i[xAxisName] = xAxis[i];
            for (let j=0; j<dataset.series.length; j++) {
                const series = dataset.series[j];
                let nameSerie = series.label.toString();
                data_i[nameSerie] = series.data[i];
                data_i[nameSerie+'_caveat'] = series.caveats ? series.caveats[i] : true;
            }
            values.push(data_i);
            //
        }
        let sort_values = values.sort(function(a, b){return a.x - b.x});
        //total_data = sort_values;
        global_data['labels'] = columnsNames;
        global_data['values'] = sort_values; //values;
        return global_data;
    }

    /**
     * Render a single chart or a GridList of charts (if grouped is true).
     */
    selectedReCharts = (nameChart, data_temp, grouped, width) => {
        // Get function to plot chart of specified type. The result is undefined
        // if the chartName is unknown.
        const data = data_temp.values;
        const labels = data_temp.labels; // array
        const chart = this.selectedReChart(nameChart, labels, data);
        if (chart === undefined) {
            return null;
        }
        // grouped =false;
        if (grouped) {
            // If grouped we just plot one chart with the all the data series
            return chart(data, width, grouped, '');
        } else {
            // Display a flex grids of individual charts for each data series.
            const charts = [];
            for (let i=1; i<data_temp.labels.length; i++) { //ignore xAxis
                let yAxisName = data_temp.labels[i];
                let data_ = data;
                //data_.push(data[i]);
                charts.push(<GridTile key={i}>{chart(data_, 400, grouped, yAxisName)}</GridTile>);
            }
            return <GridList
                    cellHeight={this.props.gridList_cellHeight}
                    cols={Math.floor(width / 400)}
                    style={{width: {width}, height: this.props.gridList_height, overflowY: this.props.gridLis_overflowY,}}>
                    {charts}
                </GridList>;
        }
    }
    
    caveatDotTemplate = (props, normalPoint) => {
    	  const {
    		    cx, cy, payload, dataKey
    		  } = props;

          console.log(props)
          console.log("Caveat? " + payload[dataKey + "_caveat"] + " -> @ " + cx + ", " + cy)
    		  if (payload[dataKey + "_caveat"] !== false) {
    		    return (
    		      /*<svg x={cx - 2} y={cy - 2} width={4} height={4} fill="red" viewBox="0 0 4 4">
    		        <path d="M 2 2 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0"/> 
    		      </svg>*/
		    	  <svg x={cx - 10} y={cy - 10} width={18} height={18} fill="red" viewBox="0 0 18 18">
		            <text x={0} y={0} dy={18} fontSize={16} >{"*"}</text>
		          </svg>
    		    );
    		  } else { 
            return normalPoint(props, cx, cy)
          }
    		};

    caveatDot = (props) => { return this.caveatDotTemplate(props, (props, cx, cy) => {
      return (
        <svg x={cx} y={cy} width={0} height={0} fill="green" viewBox="0 0 0 0">
        </svg>
      );
    })}

    		
    caveatLabels = (labels, idx) => { 
    	return (d) => !d[labels[idx] + '_caveat']
    }
    /**
     * Return a function that takes a list of data series and width as parameter
     * and renders a chart of the type that is specified in chartName.
     */
    selectedReChart = (nameChart, labels, data) => {
        var list = [];
        var i=0;
        if (nameChart === 'Area Chart') { // area chart
            for (i=1; i<labels.length; i++) {
              list.push(<Area key={'id_'+i} name={labels[i]} type="monotone" dataKey={labels[i]} stackId="1" connectNulls={false} stroke={this.listColors[i-1]} fillOpacity={1} fill={this.listColors[i-1]} />);
            }
            return (data, width, grouped, yAxisName) => (
              <AreaChart width={width} height={400} data={data} margin={{top: 10, bottom: 50, left: 50, right: 10}}>
                <XAxis dataKey="x" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                {
                  grouped ?
                  list
                  : <Area type="monotone" dataKey={yAxisName} stroke={this.listColors[0]} fillOpacity={1} fill={this.listColors[0]} />
                }
                <Brush />
              </AreaChart>
            );
        } else if (nameChart==='Bar Chart') { // bar chart
          for (i=1; i<labels.length; i++) {
            list.push(<Bar key={'id_'+i} name={labels[i]} dataKey={labels[i]} fill={this.listColors[i-1]} label={<CaveatLabel caveats={data.map(this.caveatLabels(labels,i))} /> } /> );
          }
          return (data, width, grouped, yAxisName) => (
            <BarChart width={width} height={400} data={data} margin={{top: 10, bottom: 50, left: 50, right: 10}}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis />
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
              {
                grouped ?
                list
                : <Bar id='id_' dataKey={yAxisName} fill={this.listColors[0]} label={<CaveatLabel caveats={data.map(d => !d[yAxisName + '_caveat'])} />} />
              }
              <Brush />
            </BarChart>
          );
        } else if (nameChart==='Line Chart with Points' || nameChart === 'Line Chart' || nameChart==='Line Chart without Points') { // line chart
          var dot = (nameChart === 'Line Chart without Points') ?
                      this.caveatDot :
                      (props) => { return this.caveatDotTemplate(props, (props, cx, cy) => {
                        // console.log(props)
                        return (
                          <svg x={cx-9} y={cy-9} width={18} height={18} viewBox="0 0 18 18">
                            <circle cx={9} cy={9} r={props.r} fill={props.fill} stroke-width={props.strokeWidth} stroke={props.stroke} />
                          </svg>
                        );
                      })}
                      // (props) => { return this.caveatDotTemplate(props, (props, cx, cy) => {
                      //   console.log("Point: ["+cx+", "+cy+"]");
                      //   return (
                      //   );
                      // }) }
          for (i=1; i<labels.length; i++) {
            list.push(<Line key={'id_'+i} type="monotone" name={labels[i]} dataKey={labels[i]} stroke={this.listColors[i-1]} dot={dot} />);
          }
          return (data, width, grouped, yAxisName) => (
            <LineChart width={width} height={400} data={data} margin={{top: 10, bottom: 50, left: 50, right: 10}}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis />
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
              {
                grouped ?
                list
                : <Line type="monotone" name={yAxisName} dataKey={yAxisName} stroke={this.listColors[0]} dot={dot} />
              }
              <Brush />
            </LineChart>
          );
        } else if (nameChart==='Scatter Plot') { // scatter plot
          var dataScatterChart = []; // Creating array of object [{'x': , 'y':}, {'x': , 'y':}, ..., {'x': , 'y':}]
          for (var index=1; index<labels.length; index++) {
            var dataTemp = [];
            for (i = 0; i < data.length; i++){
                var instanceSP = { 'x':data[i]["x"], 'y':data[i][labels[index]] };
                dataTemp.push(instanceSP);
            }
            dataScatterChart.push(dataTemp);
          }
          // Creating a scatter plot for each sub dataset
          for (i=1; i<labels.length; i++) {
            list.push(<Scatter key={'id_'+i} name={labels[i]} data={dataScatterChart[i-1]} fill={this.listColors[i-1]} /> );
          }
          return (data, width, grouped, yAxisName) => (
            <ScatterChart width={width} height={400} margin={{top: 10, bottom: 50, left: 50, right: 10}}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey={'x'} />
      	      <YAxis type="number" dataKey={'y'} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend verticalAlign="top" height={36} />
              {
                grouped ?
                list
                : <Scatter name={yAxisName} data={dataScatterChart[labels.indexOf(yAxisName)-1]} fill={this.listColors[0]} />
              }
            </ScatterChart>
          );
        } else if (nameChart==='Pie Chart') { // Pie Chart
          for (i=1; i<labels.length; i++) {
            list.push(<Pie key={'id_'+i} nameKey='x' data={data} dataKey={labels[i]} cx="50%" cy="50%" innerRadius={0} fill="#8884d8" label >
                      {
                        data.map((entry, index) => (
                          <Cell key={index} fill={this.listColors[index % this.listColors.length]}  />
                        ))
                      }
                      </Pie>);
          }
          return (data, width, grouped, yAxisName) => (
            <PieChart width={width} height={400} margin={{top: 10, bottom: 50, left: 50, right: 10}}>
              {
                grouped ?
                list
                : <Pie nameKey='x' data={data} dataKey={yAxisName} cx="50%" cy="50%" innerRadius={0} fill="#8884d8" label >
                    {
                      data.map((entry, index) => (
                        <Cell key={index} fill={this.listColors[index % this.listColors.length]}  />
                      ))
                    }
                  </Pie>
              }
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
            </PieChart>
          );
        } else if (nameChart==='Donut Chart') { // Donut Chart
          for (i=1; i<labels.length; i++) {
            list.push(<Pie key={'id_'+i} nameKey='x' data={data} dataKey={labels[i]} cx="50%" cy="50%" innerRadius={"20%"} outerRadius={80}  fill="#8884d8" label >
                      {
                        data.map((entry, index) => (
                          <Cell key={index} fill={this.listColors[index % this.listColors.length]}  />
                        ))
                      }
                      </Pie>);
          }
          return (data, width, grouped, yAxisName) => (
            <PieChart width={width} height={400} margin={{top: 10, bottom: 50, left: 50, right: 10}}>
              {
                grouped ?
                list
                : <Pie nameKey='x' data={data} dataKey={yAxisName} cx="50%" cy="50%" innerRadius={"20%"} outerRadius={80} fill="#8884d8" label >
                    {
                      data.map((entry, index) => (
                        <Cell key={index} fill={this.listColors[index % this.listColors.length]}  />
                      ))
                    }
                  </Pie>
              }
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
            </PieChart>
          );
        }else if (nameChart==='Radar Chart') { // Radar Chart
          var dataRadarChart = []; // Adding unique id for each record
            for (i = 0; i < data.length; i++){
              var instanceRC = {};
              instanceRC['id']='id'+i+'_'+data[i]["x"];
              for (var indexRC=0; indexRC<labels.length; indexRC++) {
                  instanceRC[labels[indexRC]]=data[i][labels[indexRC]];
              }
              dataRadarChart.push(instanceRC);
            }
          for (i=1; i<labels.length; i++) {
            list.push(<Radar key={'id_'+i} name={labels[i]} dataKey={labels[i]} stroke={this.listColors[i-1]} fill={this.listColors[i-1]} fillOpacity={0.6} />);
          }
          return (data, width, grouped, yAxisName) => (
            <RadarChart outerRadius={90} width={400} height={400} data={dataRadarChart} margin={{top: 10, bottom: 50, left: 50, right: 10}}>
              <PolarGrid />
              <PolarAngleAxis dataKey="id" />
              <PolarRadiusAxis/>
              {
                grouped ?
                list
                :
                <Radar name={yAxisName} dataKey={yAxisName} stroke={this.listColors[0]} fill={this.listColors[0]} fillOpacity={0.6} />
              }
              <Tooltip/>
              <Legend onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} />
            </RadarChart>
          );
        } else if (nameChart==='Radial Bar Chart') { // Radial Bar Chart
          return (data, width, grouped, yAxisName) => (
            // add a column 'name' in the data.
            <RadialBarChart width={width} height={400} data={data} cx={150} cy={150} innerRadius={20} outerRadius={140} barSize={10}>
              <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#fff' }} background clockWise={true} dataKey={yAxisName}/>
              <Legend iconSize={10} width={120} height={140} layout='vertical' verticalAlign='middle' wrapperStyle={{top: 0, left: 350, lineHeight: '24px'}} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            </RadialBarChart>
          );
        } else if (nameChart==='Treemap') { // Treemap
          return (data, width, grouped, yAxisName) => (
            <Treemap width={width} height={400} margin={{top: 10, bottom: 50, left: 50, right: 10}}
              data={data}
              dataKey={yAxisName}
              ratio={4 / 3}
              stroke="#fff"
              fill="#8884d8"
            >
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            </Treemap>
          );
        }
    }
    render() {

        const { dataset, identifier, onSelectCell } = this.props;
        // Return null if the dataset is empty
        if (dataset.series.length === 0) {
            return null;
        }
        const { chartType, grouped, width } = this.state;

        //var data = this.loadData(dataset);
        var data = this.fetchData(dataset);
        //var chart = this.selectedCharts(chartType, data, grouped, width);
        var chart = this.selectedReCharts(chartType, data, grouped, width);

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
                        <td className='plot-form-label' onClick={onSelectCell}>{"Charts"}</td>
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
                  <div id={identifier} className='plot-view' onClick={onSelectCell}>
                  <div>
                      {chart}
                  </div>
                </div>
            </div>
        );
    }
}

class CaveatLabel extends PureComponent {
	  render() {
	    const {
	      x, y, caveats, index,
	    } = this.props;
        if(caveats[index] === false){
		    return (
				<svg x={x - 6} y={y - 6} width={14} height={14} fill="red" viewBox="0 0 14 14">
		          <text x={0} y={0} dy={14} fontSize={16} >{"*"}</text>
		        </svg>
		    );
        }
        else{
        	return <text></text>;
        }
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
    charts : [
        "Area Chart",
        "Bar Chart",
        "Line Chart with Points",
        "Line Chart without Points",
        "Scatter Plot",
        "Pie Chart",
        "Donut Chart",
        "Radar Chart",
        "Radial Bar Chart",
        "Treemap"
    ],
};
/*<p>Got data for {this.props.rows.length} row(s) and {this.props.schema.series.length} data series</p>*/


export default Plots
