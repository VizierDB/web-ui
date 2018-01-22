/**
 * Display and manipulate the name of a data curation project.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Icon, Input } from 'semantic-ui-react'
import { IconButton } from '../../components/util/Button';
import { ErrorMessage } from '../../components/util/Message';
import { UpdateFormSpinner } from '../../components/util/Spinner';
import {
    setProjectNameErrorInForm, showProjectNameForm, updateProjectNameInForm
} from '../../actions/project/ProjectNameForm'

import '../../../css/App.css'


/**
 * Display the project name. If the edit flag is true a form is displayed
 * that allows the user to edit the name. The component maintains the project
 * name in it's internal state. This appears necessary in order to be able to
 * modify the name when the form control is displayed.
 */
class ProjectNameForm extends React.Component {
    static propTypes = {
        error: PropTypes.string,
        isEditing: PropTypes.bool.isRequired,
        isUpdating: PropTypes.bool.isRequired,
        project: PropTypes.object.isRequired
    }
    constructor(props) {
        super(props);
        this.state = {value: ''};
    }
    /**
     * Clear error message generated while updating project name
     */
    clearError = () => {
        const { dispatch } = this.props
        dispatch(setProjectNameErrorInForm(null))
    }
    /**
     * Show the project name edit form.
     */
    hideForm = () => {
        const { dispatch, project } = this.props
        if (project) {
            this.setState({value: project.name});
            dispatch(showProjectNameForm(false))
        }
    }
    /**
     * Detect ESC key press to hide edit notebook title form.
     */
    handleKeyDown = (event) => {
        if (event.keyCode === 27) {
            this.hideForm();
        } else if (event.keyCode === 13) {
            this.submitForm();
        }
    }
    /**
     * Handle changes in the form control element by updating the internal state.
     */
    handleChange = (event) => {
        this.setState({value: event.target.value});
    }
    /**
     * Depending on the edit flag either show the name or the edit name form.
     */
    render() {
        const { error, isEditing, isUpdating, project } = this.props
        // Check the edit flag to determine whether to edit form is visible.
        if (project) {
            if (isUpdating) {
                return (<UpdateFormSpinner />);
            } else if (isEditing) {
                // Show input form and possible error message at the bottom
                let errorMessage = null;
                if (error) {
                    errorMessage = (<ErrorMessage
                        title="Error while updating project name"
                        message={error}
                        handleDismiss={this.clearError}
                    />)

                }
                return (
                    <div className="project-name">
                        <Input fluid type='text' action>
                            <input
                                value={this.state.value}
                                onChange={this.handleChange}
                                onKeyDown={this.handleKeyDown}
                            />
                            <Button.Group>
                                <Button icon onClick={this.hideForm}>
                                    <Icon name='cancel' />
                                </Button>
                                <Button.Or />
                                <Button positive icon  onClick={this.submitForm}>
                                    <Icon name='check' />
                                </Button>
                            </Button.Group>
                        </Input>
                        { errorMessage }
                    </div>
                );
            } else {
                return (
                    <div className='project-name'>
                        <h1 className='project-name'>
                            {project.name}
                            <span className='left-padding-lg'>
                            <IconButton name='edit' onClick={this.showForm}/>
                            </span>
                        </h1>
                    </div>
                );
            }
        } else {
            return null;
        }
    }
    /**
     * Show the project name edit form.
     */
    showForm = () => {
        const { dispatch, project } = this.props
        if (project) {
            this.setState({value: project.name});
            dispatch(showProjectNameForm(true))
        }
    }
    /**
     * Submit the edit name form (automatically when user presses <RETURN>)
     */
    submitForm = () => {
        const { dispatch, project } = this.props
        if (project) {
            dispatch(updateProjectNameInForm(project.links.update, this.state.value))
        }
    }
}


const mapStateToProps = state => {

    return {
        error: state.projectName.error,
        isEditing: state.projectName.isEditing,
        isUpdating: state.projectName.isUpdating,
        project: state.projectPage.project
    }
}

export default connect(mapStateToProps)(ProjectNameForm)
