import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { Button, Dropdown, Input } from 'semantic-ui-react'
import { createProject, projectCreateError } from '../../actions/project/ProjectListing'
import { ErrorMessage } from '../../components/util/Message'
import { UpdateFormSpinner } from '../../components/util/Spinner'


/**
 * Display a simple button and text field to create a new project with a
 * user-defined name.
 */
class CreateProjectForm extends React.Component {
    static propTypes = {
        engines: PropTypes.array,
        error: PropTypes.string,
        isSubmitting: PropTypes.bool.isRequired
    }
    constructor(props) {
        super(props);
        let defaultEngine = null;
        const { engines } = this.props;
        if (engines) {
            engines.sort(function(e1, e2) {return e1.name.localeCompare(e2.name)});
            for (let i = 0; i < engines.length; i++) {
                const engine = engines[i];
                if (defaultEngine === null) {
                    defaultEngine = engine;
                } else if (engine.default) {
                    defaultEngine = engine;
                }
            }
        }
        this.state = {value: '', defaultEngine: defaultEngine};
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
        const { defaultEngine, value } = this.state
        if (defaultEngine) {
            dispatch(createProject(links.create, defaultEngine, value))
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
     * Set the default workflow engine to the engine whose identifier matches
     * the given value.
     */
    handleSelectEngine(e, { value }) {
        const { engines } = this.props;
        if (engines) {
            for (let i = 0; i < engines.length; i++) {
                const engine = engines[i];
                if (engine.id === value) {
                    this.setState({defaultEngine: engine})
                    return;
                }
            }
        }
    }
    /**
     * Show the create project form. The form contains three main parts: a
     * dropdown to select the workflow engine, a text field to enter the project
     * name, and a submit button. In addition there is a text line to display
     * the description about the selected workflow engine and an optional error
     * message.
     */
    render() {
        const { engines, error, isSubmitting } = this.props;
        const { defaultEngine } = this.state;
        // Check the isSubmitting flag to determine whether to display a spinner
        // or the form. Not that if engines are not set null is returned.
        if (isSubmitting) {
            return (<UpdateFormSpinner />);
        } else if (engines) {
            // Sort engines by their name
            engines.sort(function(e1, e2) {return e1.name.localeCompare(e2.name)});
            // Create list of drop-down options from list of engines
            // { key: '.com', text: '.com', value: '.com' },
            const options = []
            for (let i = 0; i < engines.length; i++) {
                const engine = engines[i];
                options.push({
                    key: engine.id,
                    text: engine.name,
                    value: engine.id
                })
            }
            // Show an error message if error is set
            let errorMessage = null;
            if (error) {
                errorMessage = (<ErrorMessage
                    title="Server Error"
                    message={error}
                    handleDismiss={this.clearCreateError.bind(this)}
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
                            defaultValue={defaultEngine.id}
                            options={options}
                            onChange={this.handleSelectEngine.bind(this)}
                        />}
                        placeholder='New Project Name ...'
                        value={this.state.value}
                        onChange={this.handleChange.bind(this)}
                        onKeyDown={this.handleKeyDown.bind(this)}
                    />
                    <p className='info-text'>
                        Create new data curation project using
                        <span className='info-bold'>{defaultEngine.name}</span>:
                        <span className='info-highlight'>{defaultEngine.description}</span>
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
        engines: state.serviceApi.engines,
        error: state.projectCreate.error,
        isSubmitting: state.projectCreate.isSubmitting,
        links: state.projectListing.links
    }
}

export default connect(mapStateToProps)(CreateProjectForm)
