import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ContentSpinner } from '../../components/util/Spinner'
import { ErrorMessage } from '../../components/util/Message';
import Notebook from '../notebook/Notebook'
import Spreadsheet from '../spreadsheet/Spreadsheet'


class Workflow extends React.Component {
    static propTypes = {
        dataset: PropTypes.object,
        fetchError: PropTypes.object,
        isFetching: PropTypes.bool.isRequired,
        workflow: PropTypes.object
    }
    render() {
        const { fetchError, isFetching, dataset, workflow } = this.props
        let content = null
        if (isFetching) {
            content = (<ContentSpinner />)
        } else if (fetchError) {
            content = (<ErrorMessage
                title={fetchError.title}
                message={fetchError.message}
            />)
        } else if (workflow) {
            if (dataset) {
                content = (<Spreadsheet />)
            } else {
                content = (<Notebook />)
            }
        }
        return content
    }
}


const mapStateToProps = state => {

    return {
        dataset: state.projectMenu.selectedDataset,
        fetchError: state.workflow.fetchError,
        isFetching: state.workflow.isFetching,
        workflow: state.workflow.workflow
    }
}

export default connect(mapStateToProps)(Workflow)
