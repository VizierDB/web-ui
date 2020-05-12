import * as React from 'react';
import styled from 'styled-components';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from 'recharts';
import {
  ListGroup,
  ListGroupItem,
} from 'react-bootstrap';
import { formatValue, isNumericColumnType } from 'src/data/utils';
import TextSummary from '../Text/TextSummary';

const MILI_5_HOURS = 18000000;

const Centered = styled.div`
  text-align: center;
`;

const DEFAULT_TOOLTIP_REAL_PRECISION = 6;

// interface ColumnDistributionPlotProps {
//   data: d3m.ColumnProfile;
//   dataset: d3m.Dataset;
//   target: Boolean;
//   showXLabel: Boolean;
//   showYLabel: Boolean;
//   showInfo: Boolean;
//   numWords?: number;
//   numColumns?: number;
//   heightTextContainer?: number;
//   widthTextContainer?: number;
// }

const Badge = styled.div`
  display: inline-block;
  height: 20px;
  padding: 3px 10px;
  border-radius: 5px;
  color:  white;
  margin: 5px 10px;
  font-size: 10px;
  background-color: ${({color}) => color || '#57068C'};
`;

function getNewBadge(column, qualities) {
  if (qualities.augmentation_type === 'join') {
    const isNew = (qualities.new_columns).find(d => d === column.colName);
    if (isNew) {
      return <Badge>New</Badge>;
    }
  }
  return '';
}

function formatDate(date) {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

class ColumnDistributionPlot extends React.Component {
  constructor(props) {
    super(props);
  }

  /**
   * Renders a label in the form of "title: value".
   * "title" is shown in bold format.
   */
  renderLabel(title, value) {
    return <>
    { this.props.showXLabel ? <Centered>
        <b>{title}:</b>
        <span className="m-1">{value}</span>
      </Centered>
      :
      <></>
    }
    </>;
  }

  renderTitle() {
    const column = this.props.data.column;
    const target = this.props.target;
    const augQuality = this.props.dataset
    .qualities && this.props.dataset
        .qualities
        .find(f => f.qualName === 'augmentation_info');

    const augQualityValue = augQuality
      ? augQuality.qualValue
      : undefined;

    return <>
    { this.props.showXLabel ? <Centered>
      {target && <Badge color="#068c39">Target</Badge>}
      {augQualityValue && getNewBadge(column, augQualityValue)}
      {column.colName}
    </Centered>
    :
    <></>
    }
    </>;
  }

  /**
   * Renderse a bar chart.
   */
  // histogramData: d3m.ColumnValueStat[]
  renderBarChart(histogramData) {
    const isNumeric = isNumericColumnType(this.props.data.column.colType);
    return (
      <ResponsiveContainer height={200}>
        <BarChart
          data={histogramData}
        >
          <XAxis
            dataKey="name"
            type={isNumeric ? 'number' : 'category'}
            padding={{ left: 10, right: 10 }}
            domain={isNumeric ? [+histogramData[0].name, +histogramData[histogramData.length - 1].name] : undefined}
          />
          {
            this.props.showInfo ?
              <YAxis width={50}>
                <Label value="Count" angle={-90} offset={10} position="insideLeft"/>
              </YAxis> // {/* compute width based on label widths */}
              :
              <></>
          }
          <CartesianGrid strokeDasharray="3 3"/>
          <Tooltip
            labelFormatter={value => {
              if (!isNumeric || this.props.data.column.colType === d3m.ColumnType.integer) {
                return value;
              }
              return (+value).toFixed(DEFAULT_TOOLTIP_REAL_PRECISION);
            }}
          />
          <Bar dataKey="count" fill="steelblue" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  /**
   * Renders a list showing all values.
   */
  renderValueList() {
    const { values } = this.props.data;
    return (
      <div className="pt-2 pb-2">
        {this.renderTitle()}
        <ListGroup style={{ maxHeight: 200, minHeight: 200, overflow: 'auto' }}>
          {values.map(feature =>
            <ListGroupItem style={{fontSize: '11px'}} key={'list_string_' + feature.name}>
              {feature.name}
            </ListGroupItem>)}
        </ListGroup>
        {this.renderLabel('Distinct Values', values.length.toString())}
      </div>
    );
  }

  /**
   * Renders a bar chart for the distinct values.
   */
  renderDistinctValues() {
    const values = this.props.data.values;
    const barChartData = values; // values.slice(0, Math.min(TOP_K, values.length));
    return (
      <div className="p-2">
        {this.renderTitle()}
        {this.renderBarChart(barChartData)}
        {this.renderLabel('Distinct Values', values.length.toString())}
      </div>
    );
  }

  /**
   * Renders a bar chart for numeric values.
   * Mean and stdDev are shown under the chart.
   */
  renderNumericValues() {
    const { mean, stdDev } = this.props.data.stats;
    const barChartData = this.props.data.values;
    return (
      <div className="p-2">
        {this.renderTitle()}
        {this.renderBarChart(barChartData)}
        {this.renderLabel('Mean', `${formatValue(mean)} ± ${formatValue(stdDev)}`)}
      </div>
    );
  }

  renderDateValues() {
    const values = this.props.data.values.map((v) => ({ ...v, date: new Date(v.name).getTime()}));
    return (
      <div className="p-2">
        {this.renderTitle()}
        <ResponsiveContainer height={200}>
          <LineChart height={50} data={values}>
            <XAxis dataKey="date" tickFormatter={(e) => {
              return formatDate(new Date(e));
            }}/>
            <YAxis dataKey="count"/>
            <CartesianGrid stroke="#eee" strokeDasharray="3 3"/>
            <Line type="monotone" dataKey="count" stroke="steelblue" dot={false} />
          </LineChart>
        </ResponsiveContainer>
        {this.renderLabel('Period', `${
          formatDate(new Date(this.props.data.stats.min + MILI_5_HOURS))} to ${
            formatDate(new Date(this.props.data.stats.max + MILI_5_HOURS))}`)}
      </div>
    );
  }

  renderTextSummary() {
    return (
      <div className="p-2">
        {this.renderTitle()}
        <TextSummary data={[this.props.data]} numWords={this.props.numWords} numColumns={this.props.numColumns}
        heightTextContainer={this.props.heightTextContainer} widthTextContainer={this.props.widthTextContainer}
        />
      </div>
      );
  }

  render() {
    if (this.props.data.isText) {
      return this.renderTextSummary();
    }
    switch (this.props.data.column.colType) {
      case d3m.ColumnType.dateTime:
        return this.renderDateValues();
      case d3m.ColumnType.real:
        return this.renderNumericValues();

      case d3m.ColumnType.boolean:
      case d3m.ColumnType.integer:
        return this.renderDistinctValues();

      case d3m.ColumnType.categorical:
        return this.renderDistinctValues();
      case d3m.ColumnType.string:
      case d3m.ColumnType.json:
      case d3m.ColumnType.realVector:
      case d3m.ColumnType.geojson:
      default:
        return this.renderValueList();
    }
  }
}

export default ColumnDistributionPlot;
