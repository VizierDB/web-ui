/**
 * Placeholder component to render dataset charts.
 */

import React from 'react'
import PropTypes from 'prop-types'
import Plots from './Plots'
import '../../../css/Chart.css'

/*
 * Plot a dataset chart for given data.
 */

class DatasetChart extends React.Component {
    /*
     * The format of the given dataset object is as follows:
     *
     * "series": {
     *   "label": "string",
     *   "data": [0]
     *  },
     * "xAxis": {
     *   "data": [0]
     * },
     * "chart": {
     *   "type": "string",
     *   "grouped": true,
     * }
 }
     */
    static propTypes = {
        dataset: PropTypes.object.isRequired
    }
    render() {
        const { dataset } = this.props
        if (dataset !== undefined) {
            return (
                <div className='plot'>
                    <Plots dataset={dataset} />
                </div>
            );
        } else {
            return null
        }
    }
}

export default DatasetChart
