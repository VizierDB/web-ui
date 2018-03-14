import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ContentSpinner } from '../../components/util/Spinner'
import { ErrorMessage } from '../../components/util/Message'
import ChartView from '../plot/ChartView'
import Notebook from '../notebook/Notebook'
import Spreadsheet from '../spreadsheet/Spreadsheet'


class Workflow extends React.Component {
    static propTypes = {
        dataset: PropTypes.object,
        fetchError: PropTypes.object,
        isFetching: PropTypes.bool.isRequired,
        hasWorkflow: PropTypes.object
    }
    render() {
        const { fetchError, isFetching, chartView, dataset, hasWorkflow } = this.props
        let content = null
        if (isFetching) {
            content = (<ContentSpinner />)
        } else if (fetchError) {
            content = (<ErrorMessage
                title={fetchError.title}
                message={fetchError.message}
            />)
        } else if (hasWorkflow) {
            if (dataset) {
                content = (<Spreadsheet />)
            } else if (chartView) {
                content = (<ChartView />)
            } else {
                content = (<Notebook />)
            }
        }
        return content
    }
}


const mapStateToProps = state => {

    return {
        chartView: state.projectMenu.selectedChartView,
        dataset: state.projectMenu.selectedDataset,
        fetchError: state.workflow.fetchError,
        isFetching: state.workflow.isFetching,
        hasWorkflow: state.workflow.workflow
    }
}

export default connect(mapStateToProps)(Workflow)
