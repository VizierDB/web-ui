/**
 * Notebook component that displays a data curation workflow. Allows to view
 * datasets for individual workflow modules.
 *
 * Existing modules can be modified or a new module be inserted at any point in
 * the workflow.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { IconButton } from '../../components/util/Button'
import NotebookCell from '../../components/notebook/NotebookCell'
import {
    clearNotebookCellDataset, loadNotebookCellDataset, reverseNotebbokCells,
    setCellErrorMessage
} from '../../actions/notebook/Notebook'
import { createProjectBranch } from '../../actions/project/ProjectMenu'
import {
    deleteWorkflowModule, insertWorkflowModule, replaceWorkflowModule
} from '../../actions/notebook/Notebook'


/**
 * A notebook containing a curation workflow contains (1) a list of notebook
 * cells and (2) a section to display the latest stae of a selected dataset.
 */
class Notebook extends React.Component {
    static propTypes = {
        cells: PropTypes.array.isRequired,
        engineRepository: PropTypes.object.isRequired,
        reversed: PropTypes.bool.isRequired,
        workflow: PropTypes.object
    }
    clearOutputDataset = (cellId) => {
        const { dispatch } = this.props
        dispatch(clearNotebookCellDataset(cellId))
    }
    /**
     * Create a new branch for the current workflow up until the module with
     * the given index.
     */
    createBranch = (cellId, name) => {
        const { cells, dispatch, workflow } = this.props
        dispatch(
            createProjectBranch(
                workflow.links.branches,
                workflow.branch,
                workflow.version,
                cells[cellId].module.id,
                name
            )
        )
    }
    deleteCellModule = (cellId, url) => {
        const { dispatch } = this.props
        dispatch(deleteWorkflowModule(cellId, url))
    }
    /**
     * Dismiss error message that is being shown for the cell with the given
     * identifier.
     */
    dismissCellError = (cellId) => {
        const { dispatch } = this.props
        dispatch(setCellErrorMessage(cellId, null))
    }
    /**
     * Insert a module into the current workflow.
     */
    insertCellModule = (cellId, url, data) => {
        const { dispatch } = this.props
        dispatch(insertWorkflowModule(cellId, url, data))
    }
    /**
     * Dispatch a load dataset request for output in the given notebook cell.
     */
    loadOutputDataset = (cellId, dataset) => {
        const { dispatch } = this.props
        dispatch(loadNotebookCellDataset(cellId, dataset.links.self))
    }
    /**
     * Display a list of notebook cells, one for each cell handle and a button
     * to reverse notebook cell ordering.
     */
    render() {
        const { cells, engineRepository, files, reversed, workflow } = this.props
        // List of notebook cells
        let notebookCells = null;
        if (workflow) {
            notebookCells = [];
            // Keep track of datasets that are available to each cell and the
            // list of links for cell actions.
            let datasets = []
            // The cell label is simply a counter that is incremented for each
            // cell that contains a workflow module. Cells without module do no
            // display their label.
            let label = 0
            for (let i = 0; i < cells.length; i++) {
                const cell = cells[i];
                // Create an object containing references for cell actions. A
                // cell that represents a workflow module has three actions:
                // branch, delete, replace. Any other cell only has one action:
                // insert.
                let links = {}
                // The cell label is an empty string for cells without modules
                if (cell.module) {
                    label++
                    links['branch'] = workflow.links.branches
                    links['delete'] = cell.module.links.delete
                    links['replace'] = cell.module.links.replace
                } else {
                    // The insert Url is either thaken from the following cell's
                    // module (if exist) or from the workflow references.
                    let url = null
                    if (i < cells.length - 1) {
                        url = cells[i + 1].module.links.insert
                    } else {
                        url = workflow.links.append
                    }
                    links['insert'] = url
                }
                notebookCells.push(
                    <NotebookCell
                        key={workflow.version + '#' + i}
                        cell={cell}
                        cellCount={cells.length}
                        datasets={datasets}
                        engine={engineRepository}
                        files={files}
                        label={label}
                        links={links}
                        notebook={this}
                    />
                );
                // Update list of datasets to ensure that it always point to the
                // datasets in the previouds module
                if (cell.module) {
                    datasets = cell.module.datasets
                }
            }
        }
        // Reverse cell order if reversed flag is true
        if (reversed) {
            notebookCells = notebookCells.reverse()
        }
        // Layout has reverse button at top followed by list of notebook cells
        return (
            <div className="notebook">
                <div className='notebook-header'>
                    <IconButton name='sort' onClick={this.reverseCells}/>
                </div>
                { notebookCells }
            </div>
        );
    }
    /**
     * Replace a module in the current workflow.
     */
    replaceCellModule = (cellId, url, data) => {
        const { dispatch } = this.props
        dispatch(replaceWorkflowModule(cellId, url, data))
    }
    /**
     * Dispatch action to reverse the ordering of notebook cells.
     */
    reverseCells = () => {
        const { dispatch } = this.props
        dispatch(reverseNotebbokCells())
    }
}

const mapStateToProps = state => {

    return {
        cells: state.notebook.cells,
        engineRepository: state.projectPage.engineRepository,
        files: state.projectPage.files,
        reversed: state.notebook.reversed,
        workflow: state.workflow.workflow
    }
}

export default connect(mapStateToProps)(Notebook)
