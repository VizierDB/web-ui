/**
 * Notebook component that displays a data curation workflow. Allows to view
 * datasets for individual workflow modules.
 *
 * Existing modules can be modified or a new module be inserted at any point in
 * the workflow.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    deleteNotebookCell, insertNotebookCell, replaceNotebookCell, showCellChart,
    showCellAnnotations, showCellDataset, showCellStdout
} from '../../actions/notebook/Notebook';
import { createBranch } from '../../actions/project/Branch';
import EditableNotebookCell from '../../components/notebook/EditableNotebookCell';
import ReadOnlyNotebookCell from '../../components/notebook/ReadOnlyNotebookCell';
import { LargeMessageButton } from '../../components/Button';
import EditResourceNameModal from '../../components/modals/EditResourceNameModal';
import { CONTENT_CHART, CONTENT_DATASET, CONTENT_TEXT } from '../../resources/Notebook';
import { isNotEmptyString } from '../../util/App';
import '../../../css/Notebook.css';


/**
 * A notebook containing a curation workflow contains (1) a list of notebook
 * cells and (2) a section to display the latest stae of a selected dataset.
 */
class Notebook extends React.Component {
    static propTypes = {
        notebook: PropTypes.object.isRequired,
        project: PropTypes.object.isRequired,
        reversed: PropTypes.bool.isRequired,
        workflow: PropTypes.object.isRequired
    }
    constructor(props) {
        super(props);
        // Keep track of the cell order and the status of the create branch
        // modal for readOnly workflows.
        this.state = {modalOpen: false}
    }
    /**
     * Create a new branch for the current workflow up until the given module.
     */
    createBranch = (module, name) => {
        const { dispatch, project, workflow } = this.props;
        dispatch(createBranch(project, workflow, module, name));
    }
    /**
     * Create a new branch from the last module in a read-only workflow.
     */
    createBranchForReadOnly = (name) => {
        const { dispatch, notebook, project, workflow } = this.props;
        const module = notebook.cells[notebook.cells.length - 1].module;
        dispatch(createBranch(project, workflow, module, name));
        this.hideModal();
    }
    /**
     * Delete the given module from the current workflow.
     */
    deleteModule = (module) => {
        const { dispatch } = this.props;
        dispatch(deleteNotebookCell(module));
    }
    /**
     * Hide the create branch modal.
     */
    hideModal = () => (this.setState({modalOpen: false}));
    /**
     * Handle pagination events when the user navigates through an output
     * dataset.
     */
    navigateDataset = (url, module, name) => {
        const { dispatch, notebook } = this.props;
        dispatch(showCellDataset(notebook, module, name, url));
    }
    /**
     * Handle select cell event for dataset output. Load the annotations for the
     * specified cell.
     */
    handleSelectCell = (module, dataset, columnId, rowId) => {
        const { dispatch, notebook } = this.props;
        dispatch(showCellAnnotations(notebook, module, dataset, columnId, rowId));
    }
    /**
     * Display a list of notebook cells. Insert placeholders for new cells
     * inbetween cells that represent workflow modules (only if workflow is
     * not read only).
     */
    render() {
        const { notebook, project, reversed, workflow } = this.props
        const { modalOpen } = this.state;
        // List of notebook cells
        const isEmptyNotebook = (notebook.cells.length === 0);
        let notebookCells = [];
        if (workflow.readOnly) {
            let errorState = false;
            for (let i = 0; i < notebook.cells.length; i++) {
                const cell = notebook.cells[i];
                errorState = cell.hasError() ? true : errorState;
                notebookCells.push(
                    <ReadOnlyNotebookCell
                        key={workflow.version + '#' + notebookCells.length}
                        cell={cell}
                        errorState={errorState}
                        sequenceIndex={i + 1}
                        onCreateBranch={this.createBranch}
                        onNavigateDataset={this.navigateDataset}
                        onOutputSelect={this.selectOutput}
                        onSelectCell={this.handleSelectCell}
                    />
                );
            }
        } else {
            // Keep track of the datasets that are available to each cell.
            let datasets = [];
            notebookCells.push(
                <EditableNotebookCell
                    key={workflow.version + '#0'}
                    cellId={0}
                    datasets={datasets}
                    env={project.environment}
                    isEmptyNotebook={isEmptyNotebook}
                    onSelectCell={this.handleSelectCell}
                    onSubmit={this.submitUpdate}
                />
            );
            let errorState = false;
            for (let i = 0; i < notebook.cells.length; i++) {
                const cell = notebook.cells[i];
                if (errorState) {
                    notebookCells.push(
                        <ReadOnlyNotebookCell
                            key={workflow.version + '#' + notebookCells.length}
                            cell={cell}
                            errorState={errorState}
                            sequenceIndex={i + 1}
                            onNavigateDataset={this.navigateDataset}
                            onOutputSelect={this.selectOutput}
                            onSelectCell={this.handleSelectCell}
                        />
                    );
                } else {
                    errorState = cell.hasError() ? true : errorState;
                    notebookCells.push(
                        <EditableNotebookCell
                            key={workflow.version + '#' + notebookCells.length}
                            cellId={notebookCells.length}
                            datasets={datasets}
                            env={project.environment}
                            isEmptyNotebook={isEmptyNotebook}
                            cell={cell}
                            sequenceIndex={i + 1}
                            onCreateBranch={this.createBranch}
                            onDeleteModule={this.deleteModule}
                            onNavigateDataset={this.navigateDataset}
                            onOutputSelect={this.selectOutput}
                            onSelectCell={this.handleSelectCell}
                            onSubmit={this.submitUpdate}
                        />
                    );
                }
                datasets = cell.module.datasets;
                if (errorState) {

                } else {
                    notebookCells.push(
                        <EditableNotebookCell
                            key={workflow.version + '#' + notebookCells.length}
                            cellId={notebookCells.length}
                            datasets={datasets}
                            env={project.environment}
                            isEmptyNotebook={isEmptyNotebook}
                            onSelectCell={this.handleSelectCell}
                            onSubmit={this.submitUpdate}
                        />
                    );
                }
            }
        }
        // Reverse cell order if reversed flag is true
        if (reversed) {
            notebookCells = notebookCells.reverse()
        }
        let notebookFooter = (
            <EditResourceNameModal
                isValid={isNotEmptyString}
                open={modalOpen}
                propmpt='Enter a name for the new branch'
                title='Create branch'
                onCancel={this.hideModal}
                onSubmit={this.createBranchForReadOnly}
            />
        );
        if (workflow.readOnly) {
            notebookFooter = (
                <div className='notebook-footer'>
                    <LargeMessageButton
                        message='This is a read-only notebook. Create a new branch to start editing.'
                        icon='code-fork'
                        onClick={this.showModal}
                    />
                    { notebookFooter }
                </div>
            );
        }
        // Layout has reverse button at top followed by list of notebook cells
        return (
            <div className="notebook">
                { notebookCells }
                { notebookFooter }
            </div>
        );
    }
    /**
     * Dispatch an action to load the resource that is being shown as output
     * for the notebook cell that displays the given workflow module.
     */
    selectOutput = (module, resourceType, resourceName) => {
        const { dispatch, notebook } = this.props;
        if (resourceType === CONTENT_CHART) {
            dispatch(showCellChart(notebook, module, resourceName));
        } else if (resourceType === CONTENT_DATASET) {
            dispatch(showCellDataset(notebook, module, resourceName));
        } else if (resourceType === CONTENT_TEXT) {
            dispatch(showCellStdout(notebook, module));
        }
    }
    /**
     * Show the create branch modal.
     */
    showModal = () => (this.setState({modalOpen: true}));
    /**
     * Handle modification of the current workflow. The cell id is used to
     * identify the cell that is being submitted. Depending on whether the
     * cell contains a workflow module of not the action inserts a new module
     * or replaces an existing one in the workflow.
     *
     * If inserting a new module we distinguish whether the module is inserted
     * before an existing module or appended to the end of the workflow.
     */
    submitUpdate = (cellId, command, data) => {
        const { dispatch, notebook, workflow } = this.props;
        // Create data object for request. Independent of insert or replace
        const reqData = {type: command.type, id: command.id, arguments: data};
        // Determine whether a new cell is being inserted or an existing cell
        // is modified.
        if ((cellId % 2) === 0) {
            // Even cell ids belong to new cells. Distinguish between inserting
            // before an existing module or the end of the workflow.
            let url = null;
            const moduleIndex = Math.floor(cellId / 2);
            if (moduleIndex < notebook.cells.length) {
                url = notebook.cells[moduleIndex].module.links.insert;
            } else {
                url = workflow.links.append;
            }
            dispatch(insertNotebookCell(url, reqData))
        } else {
            // Odd cell ids belong to existing modules
            const module = notebook.cells[Math.floor(cellId / 2)].module;
            dispatch(replaceNotebookCell(module, reqData))
        }
    }
}


const mapStateToProps = state => {
    return {
        notebook: state.notebook.notebook,
        project: state.projectPage.project,
        reversed: state.notebook.reversed,
        workflow: state.projectPage.workflow
    }
}


export default connect(mapStateToProps)(Notebook);
