
/**
 * Create Plots
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'semantic-ui-react'

import {scaleOrdinal, scaleLinear, schemeCategory10} from 'd3-scale';
import $ from 'jquery';
import {line, curveBasis} from 'd3-shape';
import {color} from 'd3-color';
import {BarChart} from 'react-d3-components';
import {GridList, GridTile} from 'material-ui/GridList';
import { Dropdown } from 'semantic-ui-react'
import '../../../css/Notebook.css'

class Plots extends React.Component {

    static propTypes = {
        dataset: PropTypes.object,
        handler: PropTypes.object.isRequired,
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        options: PropTypes.array.isRequired,
      //  value: PropTypes.string
    }

    constructor(props){
        super(props);
        this.state = {value:'simplebar' };
        this.colorTags= [ "#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#d62728", "#d62728", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"];
    }

    /*Load data on the format:
    data = [ { label: 'somethingA', values: [{x: 'SomethingA', y: 10}, {x: 'SomethingB', y: 4}, {x: 'SomethingC', y: 3}] },
             { label: 'somethingB', values: [{x: 'SomethingA', y: 6}, {x: 'SomethingB', y: 8}, {x: 'SomethingC', y: 5}]  }
           ];
    */
    loadData(dataset){
      var total_data = [];
      for(var i=0; i<dataset[0].length; i++){
        let data_i = {};
        data_i['label']=i;
        let values = [];
        for(var j=0; j<dataset.length; j++){
          let index = {};
          index['x']= j.toString();
          index['y']= parseInt(dataset[j][i]);
          values.push(index);
        }
        data_i['values']=values;
        total_data.push(data_i);
      }
      return total_data;
    }

    //Create a simple barchar. If there is more than one 'series' (columns), then it will create multiples simpleBarCharts.
    simpleBarChart(data){
      var simpleBarCharts = [];
      for(let i=0; i<data.length; i++)
      {
          let data_ = [];
          data_.push(data[i]);
          simpleBarCharts.push(<GridTile>
                                  <BarChart
                                    data={data_}
                                    width={400}
                                    height={400}
                                    margin={{top: 10, bottom: 50, left: 50, right: 10}}/> </GridTile
                                  >)
      }
      return simpleBarCharts;
    }

    //Create Grouped Bar Chart.
    groupBarChart(data){
      //var xScale = d3.scale.ordinal(); //... + set it up appropriately
      var yScale = scaleLinear();
      var colorScale = scaleOrdinal(this.colorTags);
      return <GridTile>
                <BarChart
                  groupedBars
                  colorScale={colorScale}
                  data={data}
                  width={400}
                  height={400}
                  margin={{top: 10, bottom: 50, left: 50, right: 10}}/>
              </GridTile>;
    }

    //Get legend
    getLegend(data,schema){
      var legend = [];
      for(let i=0; i<data.length; i++)
      {
          legend.push(<li style={{background:this.colorTags[i],  width:10,  marginTop:5, height:10, listStyleType: 'none'}}> <span style={{margin:15}}>{schema["series"][i]["label"]}</span></li>
        );
      }
      return legend;

    }
    handleChange = (event, { value }) => {
        this.setState({'value': value});
    }

    selectedCharts(nameChart, data){
      var chart=<div></div>;
      if(nameChart==this.props.charts[0]){ //simplebar chart
        chart = this.simpleBarChart(data);
      }
      if(nameChart==this.props.charts[1]){ //groupbar chart
        chart = this.groupBarChart(data);
      }
      return chart;
    }

    render(){
      const { row ,  schema} = this.props
      var data = this.loadData(this.props.rows);
      var chart = this.selectedCharts(this.state.value, data);
      var legend =this.getLegend(data,this.props.schema);

      const options = [];
      for (let i = 0; i < this.props.charts.length; i++) {
          const file = this.props.charts[i];
          options.push({
              key: i,
              text: this.props.charts[i],
              value: this.props.charts[i]
          })
      }
            return ( <div>
                        <div style={{marginTop:10, marginBottom:10}}>
                        <tr>
                            <td className='form-label'>{"Charts"}</td>
                            <td className='form-control'>
                                <Dropdown
                                    text={this.state.value}
                                    selection
                                    fluid
                                    scrolling
                                    options={options}
                                    onChange={this.handleChange}
                                />
                            </td>
                        </tr>
                        </div>

                        <div>
                          <GridList cellHeight={this.props.gridList_cellHeight} style={{width: this.props.gridList_width, height: this.props.gridList_height, overflowY: this.props.gridLis_overflowY,}} >
                            {chart}
                          </GridList>
                        </div>
                        <ul>
                          {legend}
                        </ul>
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
    charts : ["simplebar", "groupbar"],
};
/*<p>Got data for {this.props.rows.length} row(s) and {this.props.schema.series.length} data series</p>*/


export default Plots
