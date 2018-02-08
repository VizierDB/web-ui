import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { fetchProject } from '../../actions/project/ProjectPage'
import { ContentSpinner } from '../../components/util/Spinner'
import { ErrorMessage } from '../../components/util/Message';
import ProjectMenu from './ProjectMenu'
import ProjectNameForm from './ProjectNameForm'
import Workflow from './Workflow'

import '../../../css/App.css'
import '../../../css/ProjectPage.css'


class ProjectPage extends Component {
    static propTypes = {
        error: PropTypes.string,
        isFetching: PropTypes.bool.isRequired,
        serviceUrl: PropTypes.object
    }

    componentDidMount = () => {
        const { dispatch } = this.props
        dispatch(fetchProject(this.props.match.params.project_id))
    }

    render() {
        const { error, isFetching, project } = this.props
        let content = null;
        if (isFetching) {
            content = (<ContentSpinner />)
        } else if (error) {
            content = (<ErrorMessage
                title="Error while loading project"
                message={error}
            />)
        } else if (project) {
            document.title = 'Vizier DB - ' + project.name
            content = (
                <div>
                    <ProjectNameForm />
                    <ProjectMenu />
                    <div className='project-content'>
                        <Workflow />
                    </div>
                </div>
            )
        }
        return content;
    }
}

const mapStateToProps = state => {

    return {
        error: state.projectPage.error,
        files: state.projectPage.files,
        isFetching: state.projectPage.isFetching,
        project: state.projectPage.project
    }
}

export default connect(mapStateToProps)(ProjectPage)
