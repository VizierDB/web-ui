/**
 * Display a dataset in spreadsheet format with minimal functionality for the
 * user to interact with the data. This is a static view on a historic
 * dataset that was generated as output of a workflow module.
 */

import React from 'react'
import PropTypes from 'prop-types'

/*
 * Plot a dataset chart for given data.
 */

class DatasetChart extends React.Component {
    // .rows: Array of rows. Each row is a list of values. Note that
    //       values in a row can be null
    // .schema:
    //    .series: List of data series definitions. Each series has
    //             a .label and .index (the index of the data for the
    //             series in elements of rows)
    //    .xAxis: Optional index of x-axis labels in elements of rows
    static propTypes = {
        rows: PropTypes.array.isRequired,
        schema: PropTypes.object.isRequired
    }
    render() {
        const { rows, schema } = this.props
        const content = (
            <p>Got data for {rows.length} row(s) and {schema.series.length} data series</p>
        )
        return (
            <div>
                { content }
            </div>
        );
    }
}

export default DatasetChart
