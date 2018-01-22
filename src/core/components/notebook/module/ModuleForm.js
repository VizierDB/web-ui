/**
 * Generic component to display an input form for input of arguments of a
 * workflow module.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Button, Form, Grid } from 'semantic-ui-react'
import { ErrorMessage } from '../../util/Message'
import BoolInput from './BoolInput'
import CodeEditor from './CodeEditor'
import DatasetSelector from './DatasetSelector'
import FileSelector from './FileSelector'
import TextControl from './TextControl'
import TextSelector from './TextSelector'
import '../../../../css/ModuleForm.css'


class ModuleForm extends React.Component {
    static propTypes = {
        cell: PropTypes.object.isRequired,
        datasets: PropTypes.array.isRequired,
        files: PropTypes.array.isRequired,
        hasError: PropTypes.bool.isRequired,
        hasModule: PropTypes.bool.isRequired,
        module: PropTypes.object,
        values: PropTypes.object
    }
    constructor(props) {
        super(props)
        this.state = {...props.values, hasError: props.hasError}
    }
    componentWillReceiveProps(nextProps) {
        const { module } = this.props
        if (nextProps.module === null) {
            this.setState({hasError: false})
        } else if (module !== null) {
            if ((module.type !== nextProps.module.type) || (module.id !== nextProps.module.id)) {
                this.setState({...nextProps.values, hasError: false})
            }
        } else {
            this.setState({...nextProps.values, hasError: false})
        }
    }
    /**
     * Signal the enclosing notebook cell to displat the create branch dialog.
     */
    handleBranch = () => {
        const { cell } = this.props
        cell.setBranchAction()
    }
    /**
     * Signal the enclosing notebook cell to display the delete module dialog.
     */
    handleDelete = () => {
        const { cell } = this.props
        cell.setDeleteAction()
    }
    /**
     * Submit the form by calling the submitModuleFOrm method of the enclosing
     * notebook cell with the current form values.
     */
    handleSubmit = () => {
        const { cell, module } = this.props
        // NOTE: The list of arguments may contain values that are not valid
        // for the current module. This case appears to occur when switching
        // the selected module. Thus, we need to filter only those argumets
        // that are valid for the current module. We do this while verifying
        // the basic validity of the user-provided argument values
        const data = {type: module.type, id: module.id, arguments: {}}
        for (let i = 0; i < module.arguments.length; i++) {
            const arg = module.arguments[i]
            const value = this.state[arg.id]
            data.arguments[arg.id] = value
            if ((!value) && (arg.required)) {
                this.setState({hasError: true, errorMessage: 'Missing value for ' + arg.name})
                return
            } else if (value) {
                if ((arg.datatype === 'int') || (arg.datatype === 'rowindex')) {
                    if (isNaN(value)) {
                        this.setState({hasError: true, errorMessage: 'Expected integer value for ' + arg.name})
                        return
                    }
                } else if (arg.datatype === 'decimal') {
                    if (isNaN(value)) {
                        this.setState({hasError: true, errorMessage: 'Expected decimal value for ' + arg.name})
                        return
                    }
                } else if ((arg.datatype === 'string') || (arg.datatype === 'colindex')) {
                    if ((value.trim() === '') && (arg.required)) {
                        this.setState({hasError: true, errorMessage: 'Missing value for ' + arg.name})
                        return
                    }
                }
            }
        }
        cell.submitModuleForm(data)
    }
    render() {
        const { datasets, files, module, hasModule } = this.props
        const { hasError, errorMessage } = this.state
        // Note that values may be null in which case nothing is being rendered
        if ((module === null) || (this.state === null)) {
            return null
        }
        // Add a form component for each module module argument
        const args = module.arguments
        args.sort((a1, a2) => (a1.index > a2.index))
        let components = []
        for (let i = 0; i < args.length; i++) {
            const arg = args[i]
            if (arg.datatype === 'dataset') {
                components.push(
                    <DatasetSelector
                        key={arg.id}
                        handler={this}
                        id={arg.id}
                        label={arg.name}
                        datasets={datasets}
                        value={this.state[arg.id]}
                    />
                )
            } else if ((arg.datatype === 'string') && (arg.values)) {
                components.push(
                    <TextSelector
                        key={arg.id}
                        handler={this}
                        id={arg.id}
                        label={arg.name}
                        options={arg.values}
                        value={this.state[arg.id]}
                    />
                )
            } else if (
                (arg.datatype === 'colindex') ||
                (arg.datatype === 'string') ||
                (arg.datatype === 'rowindex') ||
                (arg.datatype === 'int') ||
                (arg.datatype === 'decimal')
            ) {
                components.push(
                    <TextControl
                        key={arg.id}
                        handler={this}
                        id={arg.id}
                        label={arg.name}
                        value={this.state[arg.id]}
                    />
                )
            } else if (arg.datatype === 'bool') {
                components.push(
                    <BoolInput
                        key={arg.id}
                        handler={this}
                        id={arg.id}
                        label={arg.name}
                        value={this.state[arg.id]}
                    />
                )
            } else if (arg.datatype === 'file') {
                components.push(
                    <FileSelector
                        key={arg.id}
                        handler={this}
                        id={arg.id}
                        label={arg.name}
                        files={files}
                        value={this.state[arg.id]}
                    />
                )
            } else if (arg.datatype === 'code') {
                components.push(
                    <CodeEditor
                        key={arg.id}
                        handler={this}
                        id={arg.id}
                        value={this.state[arg.id]}
                />
                )
            }
        }
        // Display a menu bar with buttons to submit form and optional buttons
        // to delete module and to create a new branch
        let optionalButtons = null
        if (hasModule) {
            optionalButtons = (
                <div>
                    <Button
                        icon='trash'
                        circular
                        negative
                        onClick={this.handleDelete}
                    />
                    <Button
                        icon='fork'
                        circular
                        positive
                        onClick={this.handleBranch}
                    />
                </div>
            )
        }
        let menu = (
            <Grid>
                <Grid.Column width={8}>
                    <Button
                        icon='play'
                        circular
                        primary
                        onClick={this.handleSubmit}
                    />
                </Grid.Column>
                <Grid.Column width={8} textAlign={'right'}>
                    { optionalButtons }
                </Grid.Column>
            </Grid>
        )
        if ((args.length === 1) && (args[0].datatype === 'code')) {
            return (
                <div className='code-form'>
                    <div className='editor-container'>
                        <Form>
                            { components }
                        </Form>
                    </div>
                    <div className='menu-padding'>
                        { menu }
                    </div>
                </div>
            )
        } else {
            let formCss = 'module-form'
            let error = null
            if (hasError) {
                formCss += '-error'
                if (errorMessage ) {
                    error = (<ErrorMessage title={'Invalid Arguments'} message={errorMessage}/>)
                }
            }
            return (
                <div className={formCss}>
                    { error }
                    <Form>
                        { components }
                    </Form>
                    { menu }
                </div>
            )
        }
    }
    /**
     * Set the value of a form control in the local state.
     */
    setFormValue = (name, value) => {
        this.setState({[name]: value})
    }
}

export default ModuleForm
