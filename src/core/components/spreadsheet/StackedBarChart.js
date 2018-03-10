/**
 * Create a Horizontal BarPlot
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'semantic-ui-react'
import '../../../css/Spreadsheet.css'

import {scaleLinear} from 'd3-scale';
import $ from 'jquery';
import {line, curveBasis} from 'd3-shape';
import {color} from 'd3-color';

class StackedBarChart extends React.Component {
    static propTypes = {
        dataset: PropTypes.object,
    }

    constructor(props){
        super(props);
        this.state = {'draggingSelection':false, 'dragStart':null, 'dragEnd':null, 'sortedTerms':[] };
        this.startDrag = this.startDrag.bind(this);
        this.stopDrag = this.stopDrag.bind(this);
        this.dragSVG = this.dragSVG.bind(this);
        this.sortedTerms={};
    }

    componentWillReceiveProps(props){
      this.state = {'draggingSelection':false, 'dragStart':null, 'dragEnd':null};
    }

    getTotal(values_column){
      var total_column = {};
      for (var key in values_column) {
        var sum = values_column[key].reduce(function(a, b) { return a + b; });
        var avg = sum / values_column[key].length;
        total_column[key]=sum;
      }
      return total_column;
    }

    getMean(values_column){
      var mean_column = {};
      for (var key in values_column) {
        var sum = values_column[key].reduce(function(a, b) { return a + b; });
        var avg = sum / values_column[key].length;
        mean_column[key]=avg;
      }
      return mean_column;
    }

    loadData(dataset){
      var attribute = [];
      var values_column = {};
      for (let i = 0; i < dataset.columns.length; i++) {
          const col = dataset.columns[i].name;
          attribute.push(col);
      }
      // Columns
      for (let j = 0; j < dataset.columns.length; j++) {
          let values = [];
          for (let i = 0; i < dataset.rows.length; i++) {
              const row = dataset.rows[i];
              values.push(parseInt(row.values[j]));
          }
          values_column[dataset.columns[j].name]=values;
      }
      return values_column;
    }

    render(){
      const { dataset } = this.props
      var matrix_data = this.loadData(dataset);
      var mean = this.getMean(matrix_data);
      if (this.props.type === "HORIZONTAL"){
            return this.renderHorizontal(mean);
      }
    }

    getStartEnd(dragStart, dragEnd){
      let start, end;
      if (dragStart[1] < dragEnd[1]){
        start = dragStart[1];
        end = dragEnd[1];
      }else{
        start = dragEnd[1];
        end = dragStart[1];
      }
      return [start, end];
    }


    termInPolygon(y_termPosition, dragStart , dragEnd ){
      let inside = false;
      let start_end = this.getStartEnd(dragStart , dragEnd);
      if(y_termPosition>=start_end[0] && start_end[1]>=y_termPosition){
        return !inside;
      }
      return inside;
    }

    startDrag(e){
      let container = $('#svg_bar_charts').get(0).getBoundingClientRect();
      let mouse = [e.nativeEvent.clientX - container.left - this.props.x, e.nativeEvent.clientY - container.top - this.props.y];
      this.setState({'draggingSelection':true, 'dragStart': mouse, 'dragEnd':null});
    }

    stopDrag(e){
      let container = $('#svg_bar_charts').get(0).getBoundingClientRect();
      let mouse = [e.nativeEvent.clientX - container.left - this.props.x, e.nativeEvent.clientY - container.top - this.props.y];
      //Allow some interaction with the data
      this.setState({'draggingSelection':false, 'dragEnd':mouse});

    }

    dragSVG(e){
      if (this.state.draggingSelection){
        let container = $('#svg_bar_charts').get(0).getBoundingClientRect();
        let mouse = [e.nativeEvent.clientX - container.left - this.props.x, e.nativeEvent.clientY - container.top - this.props.y];
        this.setState({'dragEnd':mouse});
      }
    }

    renderHorizontal(matrix_data) {
        let bars = [];
        var y_text_bar = 35;
        var y_rec_bar = 25;
        var increase = 14;
        var arr = Object.keys( matrix_data ).map(function ( key ) { return matrix_data[key]; });
        var min = Math.min.apply( null, arr );
        var max = Math.max.apply( null, arr );
        var minRange=1, maxRange=55;
        var scaleX = scaleLinear().domain([0,max]).range([minRange,maxRange]);

        var columns = Object.keys(matrix_data);
        columns.forEach(function(value) {
            let bars_i =   <g key={value}>
                  <rect x={65} y={y_rec_bar} width={scaleX(matrix_data[value])} height="11"  fill={"#FFFF00"} stroke={"#CCCC00"}/>
                  <text textAnchor='start' x={25} y={y_text_bar}  fontSize={11} fill={this.props.colorText} >{value}</text>
                  </g>;
            bars.push(bars_i);
            y_text_bar=y_text_bar+increase;
            y_rec_bar=y_rec_bar+increase;
        }.bind(this));

        let selectionPoly = [];
        let selectionLines = [];
        if (!(this.state.dragEnd==null) && !(this.state.dragStart==null)){
          let selectionStyle = {fill:'white', fillOpacity:0.8};

          let start, end;
          if (this.state.dragStart[1] < this.state.dragEnd[1]){
            start = this.state.dragStart[1];
            end = this.state.dragEnd[1];
          }else{
            start = this.state.dragEnd[1];
            end = this.state.dragStart[1];
          }

          let styleSelectionLine = {stroke:"#EEE",strokeWidth:2};
          if (start !== end){
              selectionPoly = [<rect x={this.props.x} width={this.props.width} y={this.props.y} height={Math.max(0, start)}
                                    style={selectionStyle} key={1}/>,
                             <rect x={this.props.x} width={this.props.width} y={this.props.y + end} height={this.props.height}
                                    style={selectionStyle} key={2}/>];

              selectionLines = [<line x1={this.props.x} y1={this.props.y + start} x2={this.props.x + this.props.width} y2={this.props.y + start} style={styleSelectionLine} key={1} />,
                                <line x1={this.props.x} y1={this.props.y + end} x2={this.props.x + this.props.width} y2={this.props.y + end} style={styleSelectionLine} key={2} />]
          }
      }

        return (
          <svg id={'svg_bar_charts'} width ={150} height ={this.props.height} style={{ marginLeft:'0', cursor:'default',MozUserSelect:'none', WebkitUserSelect:'none',msUserSelect:'none', cursor:'crosshair'}}
          onMouseDown={this.startDrag} onMouseMove={this.dragSVG}  onMouseUp={this.stopDrag}>
            <g>
              <text textAnchor='start' x={0} y={8}  fontSize={12} fill={this.props.colorText} >Mean</text>
              {bars}
              {selectionPoly}
              {selectionLines}
            </g>
          </svg>

        );
    }
}

StackedBarChart.defaultProps = {
    x:0,
    y:0,
    width:150,
    height:100,
    type: 'HORIZONTAL',
    colorText:'black',
};


export default StackedBarChart
