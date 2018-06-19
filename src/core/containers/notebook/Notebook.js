/**
 * Copyright (C) 2018 New York University
 *                    University at Buffalo,
 *                    Illinois Institute of Technology.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    changeGroupMode, deleteNotebookCell, insertNotebookCell,
    replaceNotebookCell, showCellChart, showCellAnnotations, showCellDataset,
    showCellStdout, updateNotebookCellWithUpload
} from '../../actions/notebook/Notebook';
import { createBranch } from '../../actions/project/Branch';
import EditableNotebook from '../../components/notebook/EditableNotebook';
import ReadOnlyNotebook from '../../components/notebook/ReadOnlyNotebook';
import { LargeMessageButton } from '../../components/Button';
import EditResourceNameModal from '../../components/modals/EditResourceNameModal';
import {
    CONTENT_CHART, CONTENT_DATASET, CONTENT_TEXT,
    GRP_COLLAPSE, GRP_HIDE, GRP_SHOW
} from '../../resources/Notebook';
import { isNotEmptyString } from '../../util/App';
import '../../../css/Notebook.css';

/**
 * Notebook component that displays a data curation workflow. Allows to view
 * datasets for individual workflow modules.
 *
 * Existing modules can be modified or a new module be inserted at any point in
 * the workflow.
 *
 * A notebook containing a curation workflow contains (1) a list of notebook
 * cells and (2) a section to display the latest stae of a selected dataset.
 */
class Notebook extends React.Component {
    static propTypes = {
        groupMode: PropTypes.number.isRequired,
        notebook: PropTypes.object.isRequired,
        project: PropTypes.object.isRequired,
        reversed: PropTypes.bool.isRequired,
        serviceApi: PropTypes.object.isRequired,
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
    handleShowAnnotations = (module, dataset, columnId, rowId) => {
        const { dispatch, notebook } = this.props;
        dispatch(showCellAnnotations(notebook, module, dataset, columnId, rowId));
    }
    /**
    * Change the state of group VizUAL commands mode.
    */
    handleChangeGrouping = () => {
        const { dispatch, groupMode } = this.props;
        if (groupMode === GRP_HIDE) {
            dispatch(changeGroupMode(GRP_COLLAPSE));
        } else {
            dispatch(changeGroupMode(GRP_SHOW));
        }
    }
    /**
     * Insert a module into the current workflow before the given module. If
     * the module is undefined a new module is appended to the workflow.
     */
    insertModule = (command, data, module) => {
        const { dispatch, serviceApi, workflow } = this.props;
        // Create data object for request.
        const reqData = {type: command.type, id: command.id, arguments: data};
        // Get the request Url. Depending on whether the module argument is
        // given we use the module's insert Url or append to the current
        // workflow.
        let url = null;
        if (module != null) {
            url = module.links.insert;
        } else {
            url = workflow.links.append;
        }
        dispatch(
            updateNotebookCellWithUpload(
                url,
                reqData,
                insertNotebookCell,
                serviceApi.links.upload
            )
        )
    }
    /**
     * Display a list of notebook cells. Insert placeholders for new cells
     * inbetween cells that represent workflow modules (only if workflow is
     * not read only).
     */
    render() {
        const {
            groupMode,
            notebook,
            project,
            reversed,
            workflow
        } = this.props
        const { modalOpen } = this.state;
        // List of notebook cells
        let notebookCells = [];
        if (workflow.readOnly) {
            notebookCells = (
                <ReadOnlyNotebook
                    groupMode={groupMode}
                    notebook={notebook}
                    project={project}
                    reversed={reversed}
                    workflow={workflow}
                    onChangeGrouping={this.handleChangeGrouping}
                    onCreateBranch={this.createBranch}
                    onNavigateDataset={this.navigateDataset}
                    onOutputSelect={this.selectOutput}
                    onShowAnnotations={this.handleShowAnnotations}
                />
            );
        } else {
            notebookCells = (
                <EditableNotebook
                    isEmptyNotebook={(notebook.cells.length === 0)}
                    groupMode={groupMode}
                    notebook={notebook}
                    project={project}
                    reversed={reversed}
                    workflow={workflow}
                    onChangeGrouping={this.handleChangeGrouping}
                    onCreateBranch={this.createBranch}
                    onDeleteModule={this.deleteModule}
                    onInsertModule={this.insertModule}
                    onNavigateDataset={this.navigateDataset}
                    onOutputSelect={this.selectOutput}
                    onReplaceModule={this.replaceModule}
                    onShowAnnotations={this.handleShowAnnotations}
                />
            );
        }
        let notebookFooter = (
            <EditResourceNameModal
                isValid={isNotEmptyString}
                open={modalOpen}
                prompt='Enter a name for the new branch'
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
     * Replace a module in the current workflow with the given command and
     * arguments.
     */
    replaceModule = (command, data, module) => {
        const { dispatch, serviceApi } = this.props;
        // Create data object for request.
        const reqData = {type: command.type, id: command.id, arguments: data};
        dispatch(
            updateNotebookCellWithUpload(
                module.links.replace,
                reqData,
                replaceNotebookCell,
                serviceApi.links.upload
            )
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
}


const mapStateToProps = state => {
    return {
        groupMode: state.notebook.groupMode,
        notebook: state.notebook.notebook,
        project: state.projectPage.project,
        reversed: state.notebook.reversed,
        serviceApi: state.serviceApi,
        workflow: state.projectPage.workflow
    }
}


export default connect(mapStateToProps)(Notebook);
