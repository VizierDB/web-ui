import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { Button, Dropdown, Loader, Input } from 'semantic-ui-react'
import { createProject, projectCreateError } from '../../actions/project/ProjectListing'
import { ErrorMessage } from '../../components/Message'


/**
 * Display a simple button and text field to create a new project with a
 * user-defined name.
 */
class CreateProjectForm extends React.Component {
    static propTypes = {
        envs: PropTypes.array,
        error: PropTypes.string,
        isSubmitting: PropTypes.bool.isRequired
    }
    constructor(props) {
        super(props);
        let defaultEnv = null;
        const { envs } = this.props;
        if (envs) {
            envs.sort(function(e1, e2) {return e1.name.localeCompare(e2.name)});
            for (let i = 0; i < envs.length; i++) {
                const env = envs[i];
                if (defaultEnv === null) {
                    defaultEnv = env;
                } else if (env.default) {
                    defaultEnv = env;
                }
            }
        }
        this.state = {value: '', defaultEnv: defaultEnv};
    }
    clearCreateError = () => {
        const { dispatch } = this.props
        dispatch(projectCreateError(null))
    }
    /**
     * Toggle form view whenever the edit or cancel button is clicked.
     */
    handleSubmit() {
        const { dispatch, links } = this.props
        const { defaultEnv, value } = this.state
        if (defaultEnv) {
            dispatch(createProject(links.create, defaultEnv, value))
            this.setState({value: ''});
        }
    }
    /**
     * Handle changes in the form control element by updating the internal state.
     */
    handleChange(event) {
        this.setState({value: event.target.value});
    }
    /**
     * Detect RETURN key press to submit form.
     */
    handleKeyDown(event) {
        if (event.keyCode === 13) {
            this.handleSubmit();
        }
    }
    /**
     * Set the default workflow execution environment to the entry whose
     * identifier matches the given value.
     */
    handleSelectEnv(e, { value }) {
        const { envs } = this.props;
        if (envs) {
            for (let i = 0; i < envs.length; i++) {
                const env = envs[i];
                if (env.id === value) {
                    this.setState({defaultEnv: env})
                    return;
                }
            }
        }
    }
    /**
     * Show the create project form. The form contains three main parts: a
     * dropdown to select the execution environment, a text field to enter the
     * project name, and a submit button. In addition there is a text line to
     * display the description about the selected execution environment and an
     * optional error message.
     */
    render() {
        const { envs, error, isSubmitting } = this.props;
        const { defaultEnv } = this.state;
        // Check the isSubmitting flag to determine whether to display a spinner
        // or the form. Note that if environments are not set, null is returned.
        if (isSubmitting) {
            return <Loader inline active={true} />;
        } else if (envs) {
            // Sort environments by their name
            envs.sort(function(e1, e2) {return e1.name.localeCompare(e2.name)});
            // Create list of drop-down options from list of environments
            // { key: '.com', text: '.com', value: '.com' },
            const options = []
            for (let i = 0; i < envs.length; i++) {
                const env = envs[i];
                options.push({
                    key: env.id,
                    text: env.name,
                    value: env.id
                })
            }
            // Show an error message if error is set
            let errorMessage = null;
            if (error) {
                errorMessage = (<ErrorMessage
                    title="Server Error"
                    message={error}
                    onDismiss={this.clearCreateError.bind(this)}
                />);
            }
            return (
                <div className="create-project-form">
                    <Input
                        fluid
                        type='text'
                        action={<Button
                            color='green'
                            icon='plus'
                            onClick={this.handleSubmit.bind(this)}
                        />}
                        label={<Dropdown
                            defaultValue={defaultEnv.id}
                            options={options}
                            onChange={this.handleSelectEnv.bind(this)}
                        />}
                        placeholder='New Project Name ...'
                        value={this.state.value}
                        onChange={this.handleChange.bind(this)}
                        onKeyDown={this.handleKeyDown.bind(this)}
                    />
                    <p className='info-text'>
                        Create new data curation project using
                        <span className='info-bold'>{defaultEnv.name}</span>:
                        <span className='info-highlight'>{defaultEnv.description}</span>
                    </p>
                    { errorMessage }
                </div>
            );
        } else {
            return null;
        }
    }
}

const mapStateToProps = state => {

    return {
        envs: state.serviceApi.envs,
        error: state.projectCreate.error,
        isSubmitting: state.projectCreate.isSubmitting,
        links: state.projectListing.links
    }
}

export default connect(mapStateToProps)(CreateProjectForm)
