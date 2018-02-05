/**
 * Cell in a data curation workflow. There are two main types of notebook cells,
 * (i) those that correspond to an existing workflow module and (ii) those that
 * do not correspond to a workflow module. The latter are placeholders for new
 * workflow modules.
 * Each cell has a compact and expanded mode. For workflow module cells the
 * compact mode displays the command text and the module outputs (i.e., STDOUT
 * and STDERR). For a non-module cell the compact view is simply a PLUS icon.
 */

import React from 'react';
import PropTypes from 'prop-types'
import { Button, Divider, Header, Icon, Input, Modal } from 'semantic-ui-react'
import { ContentSpinner } from '../../components/util/Spinner'
import { ErrorMessage } from '../../components/util/Message';
import { IconButton } from '../../components/util/Button'
import CellModule from './CellModule'
import ModuleOutput from './ModuleOutput'
import NotebookCellOutput from './NotebookCellOutput'
import { moduleIdentifier } from '../../util/Api'
import {
    DELETE_COLUMN, DELETE_ROW, DROP_DATASET, INSERT_COLUMN, INSERT_ROW, LOAD,
    MOVE_COLUMN, MOVE_ROW, RENAME_COLUMN, RENAME_DATASET, UPDATE_CELL, VIZUAL_OP
} from '../../util/Vizual'
import '../../../css/Notebook.css'
import '../../../css/ResourceListing.css'
import '../../../css/Spinner.css'


// -----------------------------------------------------------------------------
// Helper Methods
// -----------------------------------------------------------------------------

/**
 * Generate text representation for  a given workflow module command.
 */
const commandText = (command) => {
    const type = command.type
    const id = command.id
    const args = {}
    for (let i = 0; i < command.arguments.length; i++) {
        const arg = command.arguments[i]
        args[arg.name] = arg.value
    }
    if ((type === VIZUAL_OP) && (id === DELETE_COLUMN)) {
        return 'DELETE COLUMN ' + args.column + ' FROM ' + args.dataset
    } else if ((type === VIZUAL_OP) && (id === DELETE_ROW)) {
        return 'DELETE ROW ' + args.row + ' FROM ' + args.dataset
    } else if ((type === VIZUAL_OP) && (id === DROP_DATASET)) {
        return 'DROP DATASET ' + args.dataset
    } else if ((type === VIZUAL_OP) && (id === INSERT_COLUMN)) {
        return 'INSERT COLUMN \'' + args.name + '\' INTO ' + args.dataset + ' AT POSITION ' + args.position
    } else if ((type === VIZUAL_OP) && (id === INSERT_ROW)) {
        return 'INSERT ROW INTO ' + args.dataset + ' AT POSITION ' + args.position
    } else if ((type === VIZUAL_OP) && (id === LOAD)) {
        return 'LOAD DATASET ' + args.name
    } else if ((type === VIZUAL_OP) && (id === MOVE_COLUMN)) {
        return 'MOVE COLUMN ' + args.column + ' IN ' + args.dataset + ' TO POSITION ' + args.position
    } else if ((type === VIZUAL_OP) && (id === MOVE_ROW)) {
        return 'MOVE ROW ' + args.row + ' IN ' + args.dataset + ' TO POSITION ' + args.position
    } else if ((type === VIZUAL_OP) && (id === RENAME_COLUMN)) {
        return 'RENAME COLUMN ' + args.column + ' IN ' + args.dataset + ' TO ' + args.name
    } else if ((type === VIZUAL_OP) && (id === RENAME_DATASET)) {
        return 'RENAME DATASET ' + args.dataset + ' TO ' + args.name
    } else if ((type === VIZUAL_OP) && (id === UPDATE_CELL)) {
        return 'UPDATE ' + args.dataset + ' SET [' + args.column + ',' + args.row + '] = \'' + args.value + '\''
    } else if ((type === 'python') && (id === 'CODE')) {
        return args.source
    } else if ((type === 'mimir') && (id === 'KEY_REPAIR')) {
        return 'CREATE KEY REPAIR LENS FOR COLUMN ' + args.column + ' IN ' + args.dataset
    } else if ((type === 'mimir') && (id === 'MISSING_KEY')) {
        return 'CREATE MISSING KEY LENS FOR COLUMN ' + args.column + ' IN ' + args.dataset
    } else if ((type === 'mimir') && (id === 'MISSING_VALUE')) {
        return 'CREATE MISSING VALUE LENS FOR COLUMN ' + args.column + ' IN ' + args.dataset
    } else if ((type === 'mimir') && (id === 'PICKER')) {
        let columns = ''
        for (let i = 0; i < args.schema.length; i++) {
            const column = args.schema[i].pickFrom
            if (i === 0) {
                columns = column
            } else {
                columns += ',' + column
            }
        }
        let pickAs = ''
        if (args.pickAs) {
            pickAs = ' AS ' + args.pickAs
        }
        return 'PICK FROM ' + columns + pickAs + ' IN ' + args.dataset
    } else if ((type === 'mimir') && (id === 'SCHEMA_MATCHING')) {
        let columns = ''
        for (let i = 0; i < args.schema.length; i++) {
            const tuple = args.schema[i]
            if (tuple.column) {
                if (i === 0) {
                    columns = tuple.column
                } else {
                    columns += ',' + tuple.column
                }
            }
        }
        return 'SCHEMA MATCHING ' + args.dataset + '(' + columns + ') AS ' + args.resultName
    } else if ((type === 'mimir') && (id === 'TYPE_INFERENCE')) {
        return 'TYPE INFERENCE FOR COLUMNS IN ' + args.dataset + ' WITH percent_conform = '+ args.percentConform
    }
}

const defaultArguments = (moduleSpec, datasets) => {
    const args = {}
    for (let i = 0; i < moduleSpec.arguments.length; i++) {
        const arg = moduleSpec.arguments[i]
        if (arg.datatype === 'bool') {
            args[arg.id] = false
        } else if ((arg.datatype === 'dataset') && (datasets)) {
            if (datasets.length > 0) {
                args[arg.id] = datasets[0].name
            } else {
                args[arg.id] = ''
            }
        } else if (arg.datatype === 'group') {
            args[arg.id] = []
        } else if (!arg.parent) {
            args[arg.id] = ''
        }
    }
    return args
}

const commandArguments = (moduleSpec, command) => {
    const args = defaultArguments(moduleSpec)
    for (let i = 0; i < command.arguments.length; i++) {
        const arg = command.arguments[i]
        args[arg.name] = arg.value
    }
    return args
}

const ACTION_BRANCH = 'BRANCH'
const ACTION_DELETE = 'DELETE'

class NotebookCell extends React.Component {
    static propTypes = {
        cell: PropTypes.object.isRequired,
        cellCount: PropTypes.number.isRequired,
        datasets: PropTypes.array.isRequired,
        engine: PropTypes.object.isRequired,
        files: PropTypes.array.isRequired,
        label: PropTypes.number.isRequired,
        links: PropTypes.object.isRequired,
        notebook: PropTypes.object.isRequired,
    }
    constructor(props) {
        super(props)
        const { cell, engine } = props
        let selectedModule = null
        let formDefaults = null
        let formError = false
        if (cell.module) {
            const cmd = cell.module.command
            selectedModule = engine.module[moduleIdentifier(cmd)]
            formDefaults = commandArguments(selectedModule, cmd)
            formError = cell.module.stderr.length > 0
        }
        this.state = {
            action: null,
            expanded: false,
            inputValue: '',
            invalidBranchName: true,
            selectedModule: selectedModule,
            formDefaults: formDefaults,
            formError: formError
        }
    }
    /**
     * Dismiss any open modal.
     */
    cancelAction = () => {
        this.setState({action: null, inputValue: '', invalidBranchName: true})
    }
    /**
     * Clear any output dataset that may be shown for this cell. Calls the
     * respective clearOutputDataset method of the associated notebook.
     */
    clearDataset = () => {
        const { cell, notebook } = this.props
        notebook.clearOutputDataset(cell.id)
    }
    /**
     * Reset the component after an update (i.e., when the cell is currently
     * busy but the new properties indicate that it is not busy anymore).
     */
    componentWillReceiveProps(nextProps) {
        const { cell, engine } = this.props
        if ((cell.isBusy) && (!nextProps.cell.isBusy)) {
            let selectedModule = null
            let formDefaults = null
            let formError = false
            if (nextProps.cell.module) {
                const cmd = nextProps.cell.module.command
                selectedModule = engine.module[moduleIdentifier(cmd)]
                formDefaults = commandArguments(selectedModule, cmd)
                formError = nextProps.cell.module.stderr.length > 0
            }
            this.setState({
                action: null,
                expanded: false,
                inputValue: '',
                invalidBranchName: true,
                selectedModule: selectedModule,
                formDefaults: formDefaults,
                formError: formError
            })
        }
    }
    /**
     * Call the createBranch method of the associated notebook.
     */
    createBranch = () => {
        const { cell, notebook } = this.props
        const { inputValue } = this.state
        if (inputValue.trim() !== '') {
            notebook.createBranch(cell.id, inputValue.trim())
            this.cancelAction()
        }
    }
    /**
     * Delete the module that is associated with this cell from the workflow.
     */
    deleteCell = () => {
        const { cell, links, notebook } = this.props
        notebook.deleteCellModule(cell.id, links.delete)
        this.cancelAction()
    }
    /**
     * Dismiss an error message that is shown for the notebook cell.
     */
    dismissError = () => {
        const { cell, notebook } = this.props
        notebook.dismissCellError(cell.id)
    }
    /**
     * Callback handler to expand the view of a notebook cell. Calls the
     * expandCell method of the associated notebook container.
     */
    handleExpandClick = () => {
        const { expanded } = this.state
        if (expanded) {
            const { cell, engine } = this.props
            // Reset selected module if the cell is being collapsed
            let selectedModule = null
            let formDefaults = null
            let formError = false
            if (cell.module) {
                const cmd = cell.module.command
                selectedModule = engine.module[moduleIdentifier(cmd)]
                formDefaults = commandArguments(selectedModule, cmd)
                formError = cell.module.stderr.length > 0
            }
            this.setState({
                expanded: false,
                selectedModule: selectedModule,
                formDefaults: formDefaults,
                formError: formError
            })
        } else {
            this.setState({expanded: true})
        }
    }
    /**
     * Handle changes in the input control. Disable the create branch sumbit
     * button if an empty name is given.
     */
    handleChange = (event) => {
        const val = event.target.value
        this.setState({inputValue: val, invalidBranchName: val.trim() === ''})
    }
    /**
     * Handle ESC and RETURN to cancel or submit the create branch modal.
     */
    handleKeyDown = (event) => {
        const { invalidBranchName } = this.state
        if ((event.keyCode === 13) && (!invalidBranchName)) {
            this.createBranch()
        } else if (event.keyCode === 27) {
            this.cancelAction();
        }
    }
    /**
     * Callback handler when user selects a module dataset for output. Calls the
     * loadOutputDataset method of the associated notebook.
     */
    loadDataset = (dataset) => {
        const { cell, notebook } = this.props
        notebook.loadOutputDataset(cell.id, dataset)
    }
    /**
     * Show notebook cell content. There are four different layouts depending on
     * the values of the isExpanded and hasModule flags. The general layout is
     * two columns: the first column contain the cell index and the second
     * column the cell module.
     */
    render() {
        const { cell, cellCount, datasets, engine, files, label } = this.props
        const { expanded, formDefaults, formError, selectedModule } = this.state
        // If the cell isBusy flag is true or if an error message occured no
        // other information but a spinner or error message, respectively, is
        // shown
        let content = null
        if (cell.isBusy) {
            content = (
                <div className='spinner-padded'>
                    <ContentSpinner />
                </div>
            )
        } else if (cell.error) {
            const error = cell.error
            content = <ErrorMessage
                title={error.title}
                message={error.message}
                handleDismiss={this.dismissError}
            />
        } else {
            // Two column layout
            let cellIndexColumn = null
            let cellModuleColumn = null
            // Allow different layouts for expanded cells
            let cellCssSuffix = ''
            if (expanded) {
                cellCssSuffix = '-expanded'
            }
            // Depending on the isExpanded and hasModule flags there are a total of
            // four different views on the notebook cell.
            if ((!cell.module) && (!expanded)) {
                // Compact, non-module cell. Only show an 'Add Cell' button if
                // the notebook is empty (i.e., cellCount == 1)
                if (cellCount === 1) {
                    cellModuleColumn = (
                        <div>
                            <p className='empty-notebook-message'>
                                Your notebook is empty. Start by adding a new cell.
                            </p>
                            <p className='empty-notebook-button'>
                                <IconButton name='plus fa-4x' onClick={this.handleExpandClick}/>
                            </p>
                        </div>
                    );
                } else {
                    cellModuleColumn = (
                        <Divider horizontal>
                            <IconButton
                                name='plus-square-o'
                                onClick={this.handleExpandClick}
                            />
                        </Divider>
                    );
                }
            } else if ((!cell.module) && (expanded)) {
                // Expanded, non-module cell. Allows the user to select a command
                // from the dropdown list and enter command specific arguments. The
                // cell index displays a close button.
                cellIndexColumn = (
                    <div className='collapsed-notebook-cell'>
                        <IconButton
                            name='minus-square-o'
                            onClick={this.handleExpandClick}
                        />
                    </div>
                );
                // If a module specification has been selected display the module
                // input form
                cellModuleColumn = (
                    <CellModule
                        datasets={datasets}
                        engine={engine}
                        files={files}
                        module={selectedModule}
                        notebookCellComponent={this}
                        values={formDefaults}
                        hasError={false}
                        hasModule={false}
                    />
                )
            } else if (cell.module) {
                // Module cell. Independent of whether the cell is in compact or
                // expanded mode the cell index contains a clickable display of
                // the cell index number.
                cellIndexColumn = (
                    <span className='notebook-cell-index'>
                        [
                        <a
                            className='notebook-cell-index'
                            onClick={this.handleExpandClick}
                        >
                            {label}
                        </a>
                        ]
                    </span>
                )
                if (!expanded) {
                    // In compact mode only the module output is being displayed
                    let cssSuffix = ''
                    if (cell.module.stderr.length > 0) {
                        cssSuffix = '-error'
                    }
                    cellModuleColumn = (
                            <div
                                className='notebook-cell-module'
                                onDoubleClick={this.handleExpandClick}>
                                <pre className={'collapsed-command' + cssSuffix}>
                                    {commandText(cell.module.command)}
                                </pre>
                                <ModuleOutput module={cell.module} />
                            </div>
                    )
                } else {
                    // Show a modal if the user has chosen one of the notebook cell
                    // actions
                    let modal = null
                    const { action } = this.state
                    if (action === ACTION_DELETE) {
                        modal =  (
                            <Modal open={true} basic size='small'>
                                <Header icon='trash' content='Delete Notebook Cell' />
                                <Modal.Content>
                                    <p>Do you really want to delete notebook cell #{label}</p>
                                </Modal.Content>
                                <Modal.Actions>
                                    <Button basic color='red' inverted onClick={this.cancelAction}>
                                        <Icon name='remove' /> No
                                    </Button>
                                    <Button color='green' inverted onClick={this.deleteCell}>
                                        <Icon name='checkmark' /> Yes
                                    </Button>
                                </Modal.Actions>
                            </Modal>
                        )
                    } else if (action === ACTION_BRANCH) {
                        modal = (
                            <Modal open={true} size={'small'}>
                                <Modal.Header>Create Branch</Modal.Header>
                                <Modal.Content>
                                    <div className="resource-name">
                                        <p>Enter a name for the new branch</p>
                                        <Input
                                            autoFocus
                                            className="resource-name-input"
                                            value={this.state.inputValue}
                                            onChange={this.handleChange}
                                            onKeyDown={this.handleKeyDown}
                                        />
                                    </div>
                                </Modal.Content>
                                <Modal.Actions>
                                    <Button  negative onClick={this.cancelAction}>
                                        Cancel
                                    </Button>
                                    <Button
                                        positive
                                        icon='checkmark'
                                        labelPosition='right'
                                        content="Create"
                                        disabled={this.state.invalidBranchName}
                                        onClick={this.createBranch}
                                    />
                                </Modal.Actions>
                            </Modal>
                        )
                    }
                    cellModuleColumn = (
                        <div>
                            <CellModule
                                datasets={datasets}
                                engine={engine}
                                files={files}
                                module={selectedModule}
                                notebookCellComponent={this}
                                values={formDefaults}
                                hasError={formError}
                                hasModule={true}
                            />
                            <NotebookCellOutput
                                cell={this}
                                datasets={cell.module.datasets}
                                module={cell.module}
                                outputDataset={cell.dataset}
                            />
                            { modal }
                        </div>
                    )
                }
            }
            content = (
                <div className='notebook-cell'>
                    <div className={'notebook-cell-index' + cellCssSuffix}>
                        {cellIndexColumn}
                    </div>
                    <div className={'notebook-cell-module' + cellCssSuffix}>
                        {cellModuleColumn}
                    </div>
                </div>
            )
        }
        return content
    }
    /**
     * Handle user selection of a module type in dropdown. Passes the call down
     * to the associated notebook.
     */
    selectModule(modSpec) {
        const { datasets } = this.props
        this.setState({
            selectedModule: modSpec,
            formDefaults: defaultArguments(modSpec, datasets),
            formError: false
        })
    }
    /**
     * Set the cretae branch action to display the modal that allows the user to
     * enter a new branch name.
     */
    setBranchAction = () => {
        this.setState({action: ACTION_BRANCH})
    }
    /**
     * Set the delete module action to display the dialog that lets the user
     * conform or cancel the delete action.
     */
    setDeleteAction = () => {
        this.setState({action: ACTION_DELETE})
    }
    /**
     * Submit the cell form. Depending on whether this cell represents an
     * existing or a new module the replace or insert Url is used and the
     * respective method of the associated notebook is called.
     */
    submitModuleForm = (data) => {
        const { cell, links, notebook } = this.props
        if (cell.module) {
            notebook.replaceCellModule(cell.id, links.replace, data)
        } else {
            notebook.insertCellModule(cell.id, links.insert, data)
        }
    }
}

export default NotebookCell;
