/**
 * Component to display a dataset chart view.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { ContentSpinner } from '../../components/util/Spinner'
import { ErrorMessage } from '../../components/util/Message';
import DatasetChart from '../../components/plot/DatasetChart'


/**
 * Component to display a dataset chart view.
 */
class ChartView extends React.Component {
    static propTypes = {
        data: PropTypes.object,
        error: PropTypes.object,
        isBusy: PropTypes.bool.isRequired
    }
    render() {
        const { data, error, isBusy } = this.props
        let content = null;
        if (isBusy) {
            content = (
                <div className='spinner-padding'>
                    <ContentSpinner />
                </div>
            )
        } else if (error) {
            content = (<ErrorMessage
                title={error.title}
                message={error.message}
            />)
        } else if (data) {
            content = <DatasetChart rows={data.rows} schema={data.schema} />
        }
        return content;
    }
}


const mapStateToProps = state => {
    return {
        data: state.chartView.data,
        error: state.chartView.error,
        isBusy: state.chartView.isBusy
    }
}

export default connect(mapStateToProps)(ChartView)
