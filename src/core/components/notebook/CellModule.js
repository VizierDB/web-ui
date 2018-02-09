/**
 * Generic component to display an input form for input of arguments of a
 * workflow module.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'semantic-ui-react'
import { ErrorMessage } from '../util/Message'
import BoolInput from './module/BoolInput'
import CodeEditor from './module/CodeEditor'
import ControlGroup from './module/ControlGroup'
import DatasetSelector from './module/DatasetSelector'
import FileSelector from './module/FileSelector'
import TextControl from './module/TextControl'
import TextSelector from './module/TextSelector'
import CellMenu from './CellMenu'
import CommandsListing from './CommandsListing'
import '../../../css/ModuleForm.css'


class CellModule extends React.Component {
    static propTypes = {
        datasets: PropTypes.array.isRequired,
        env: PropTypes.object.isRequired,
        files: PropTypes.array.isRequired,
        hasError: PropTypes.bool.isRequired,
        hasModule: PropTypes.bool.isRequired,
        module: PropTypes.object,
        notebookCellComponent: PropTypes.object.isRequired,
        values: PropTypes.object
    }
    constructor(props) {
        super(props)
        const { hasError, values } = props
        this.state = {...values, hasError: hasError}
    }
    componentWillReceiveProps(nextProps) {
        const { module } = this.props
        if (nextProps.module === null) {
            this.setState({hasError: false})
        } else if (module !== null) {
            if ((module.type !== nextProps.module.type) || (module.id !== nextProps.module.id)) {
                this.setState({...nextProps.values, hasError: false})
            } else {
            }
        } else {
            this.setState({...nextProps.values, hasError: false})
        }
    }
    /**
     * Submit the form by calling the submitModuleFOrm method of the enclosing
     * notebook cell with the current form values.
     */
    handleSubmit = () => {
        const { notebookCellComponent, module } = this.props
        // NOTE: The list of arguments may contain values that are not valid
        // for the current module. This case appears to occur when switching
        // the selected module. Thus, we need to filter only those argumets
        // that are valid for the current module. We do this while verifying
        // the basic validity of the user-provided argument values
        const data = {type: module.type, id: module.id, arguments: {}}
        for (let i = 0; i < module.arguments.length; i++) {
            const arg = module.arguments[i]
            if (arg.parent) {
                continue
            }
            let value = this.state[arg.id]
            data.arguments[arg.id] = value
            if ((value === null) && (arg.required)) {
                this.setState({hasError: true, errorMessage: 'Missing value for ' + arg.name})
                return
            } else if (value !== null) {
                if (value.trim) {
                    value = value.trim()
                }
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
                    if ((value === '') && (arg.required)) {
                        this.setState({hasError: true, errorMessage: 'Missing value for ' + arg.name})
                        return
                    }
                }
            }
        }
        notebookCellComponent.submitModuleForm(data)
    }
    render() {
        const {
            notebookCellComponent, datasets, env, files, module, hasModule
        } = this.props
        const { hasError, errorMessage } = this.state
        // Note that values may be null in which case nothing is being rendered
        if ((this.state === null)) {
            return null
        }
        let content = null;
        if (module) {
            let moduleForm = null;
            // Add a form component for each module module argument
            const args = module.arguments
            args.sort((a1, a2) => (a1.index > a2.index))
            let components = []
            for (let i = 0; i < args.length; i++) {
                const arg = args[i]
                // Skip elements that are part of a group
                if (arg.parent) {
                    continue
                }
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
                } else if (arg.datatype === 'group') {
                    const children = []
                    for (let j = 0; j < args.length; j++) {
                        const child = args[j]
                        if (child.parent === arg.id) {
                            children.push(child)
                        }
                    }
                    components.push(
                        <ControlGroup
                            key={arg.id}
                            children={children}
                            handler={this}
                            id={arg.id}
                            label={arg.name}
                            values={this.state[arg.id]}
                        />
                    )
                }
            }
            if ((args.length === 1) && (args[0].datatype === 'code')) {
                moduleForm = (
                    <div className='code-form'>
                        <div className='editor-container'>
                            <Form>
                                { components }
                            </Form>
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
                moduleForm = (
                    <div className={formCss}>
                        { error }
                        <table className='form-table'>
                            <tbody>
                                { components }
                            </tbody>
                        </table>
                    </div>
                )
            }
            content = (
                <div>
                    <CellMenu
                        cellModuleComponent={this}
                        env={env}
                        hasModule={hasModule}
                        module={module}
                        notebookCellComponent={notebookCellComponent}
                    />
                    { moduleForm }
                </div>
            )
        } else {
            content = (
                <CommandsListing
                    notebookCellComponent={notebookCellComponent}
                    env={env}
                />);
        }
        return content
    }
    /**
     * Set the value of a form control in the local state.
     */
    setFormValue = (name, value) => {
        this.setState({[name]: value})
    }
}

export default CellModule
