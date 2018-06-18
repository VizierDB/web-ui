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
import { PropTypes } from 'prop-types';
import { CloseButton } from '../../Button'
import EditResourceNameModal from '../../modals/EditResourceNameModal';
import DeleteResourceModal from '../../modals/DeleteResourceModal';
import CellIndex from '../input/CellIndex';
import CellInputArea from '../input/CellInputArea';
import CollapsedEmptyCellInput from '../input/CollapsedEmptyCellInput';
import CollapsedWorkflowCellInput from '../input/CollapsedWorkflowCellInput';
import CellOutputArea from '../output/CellOutputArea';
import { isNotEmptyString } from '../../../util/App';
import '../../../../css/Notebook.css';


// MODAL IDENTIFIER
const MODAL_BRANCH = 'BRANCH';
const MODAL_DELETE = 'DELETE';


/**
 * Cell in a modifiable notebook. Displays a cell input area and cell output
 * area if the cell is associated with a workflow module.
 *
 * Cell input area is a two column layout. Content depends on whether (a) the
 * cell contains a workflow module, and (b) the cell is expanded or collapsed.
 * A cell without a workflow module is called an empty cell. If collapsed a
 * divider is shown. For workflow cells the cell sequence index and the module
 * command is shown. If expanded a module input form is shown in both cases.
 */
class EditableNotebookCell extends React.Component {
    static propTypes = {
        cell: PropTypes.object,
        datasets: PropTypes.array.isRequired,
        env: PropTypes.object.isRequired,
        sequenceIndex: PropTypes.number,
        serviceApi: PropTypes.object.isRequired,
        onCreateBranch: PropTypes.func,
        onDeleteModule: PropTypes.func,
        onNavigateDataset: PropTypes.func,
        onOutputSelect: PropTypes.func,
        onShowAnnotations: PropTypes.func,
        onSubmit: PropTypes.func.isRequired
    }
    constructor(props) {
        super(props);
        this.state = {expanded: false, showModal: null}
    }
    /**
     * Handle cell collapse event.
     */
    handleCollapse = () => (this.setState({expanded: false}));
    /**
     * Submit create new branch request from this module.
     */
    handleCreateBranch = (name) => {
        const { cell, onCreateBranch } = this.props;
        this.hideModal();
        onCreateBranch(cell.module, name);
    };
    /**
     * Submit delete module request for current module.
     */
    handleDeleteModule = () => {
        const { cell, onDeleteModule } = this.props;
        this.hideModal();
        onDeleteModule(cell.module);
    };
    /**
     * Handle cell expand event.
     */
    handleExpand = () => (this.setState({expanded: true}));
    /**
     * Handle command submit. Call the provided onSubmit method and pass along
     * the module in the notebook (needed to get the Url for the submit
     * request).
     */
    handleSubmit = (command, data) => {
        const { cell, onSubmit } = this.props;
        onSubmit(command, data, cell.module);
    }
    /**
     * Hide any open modal.
     */
    hideModal = () => (this.setState({showModal: null}));
    render() {
        const {
            cell,
            datasets,
            env,
            sequenceIndex,
            serviceApi,
            onNavigateDataset,
            onOutputSelect,
            onShowAnnotations
        } = this.props;
        let module = null;
        let hasError = false;
        if (cell != null) {
            module = cell.module;
            hasError = cell.hasError();
        }
        const { expanded, showModal } = this.state;
        const isEmptyCell = (cell == null);
        // The general output is different for collapsed empty cells. In this
        // case no cell frame is shown but simply a divider or a message button.
        if ((isEmptyCell) && (!expanded)) {
            return (
                <CollapsedEmptyCellInput
                    isEmptyNotebook={false}
                    onExpand={this.handleExpand}
                />
            );
        }
        // The content of the input area depends on whether (a) the cell is
        // expanded and (b) is associated with a workflow module.
        let inputArea = null;
        if (expanded) {
            let cellIndex = null;
            if (isEmptyCell) {
                cellIndex = (
                    <CloseButton
                        name='minus-square-o'
                        onClick={this.handleCollapse}
                    />
                );
            } else {
                cellIndex = (
                    <CellIndex
                        errorState={hasError}
                        onClick={this.handleCollapse}
                        sequenceIndex={sequenceIndex}
                    />
                );
            }
            inputArea = (
                <table className='cell-area'><tbody>
                    <tr>
                        <td className='cell-index'>
                            {cellIndex}
                        </td>
                        <td className='cell-cmd'>
                            <div className='cell-form'>
                                <CellInputArea
                                    datasets={datasets}
                                    env={env}
                                    module={module}
                                    serviceApi={serviceApi}
                                    onCreateBranch={this.showCreateBranchModal}
                                    onDeleteModule={this.showDeleteModuleModal}
                                    onSubmit={this.handleSubmit}
                                />
                            </div>
                        </td>
                    </tr>
                </tbody></table>
            );
        } else {
            // If collapsed the cell cannot be empty (because of earlier output)
            inputArea = (
                <CollapsedWorkflowCellInput
                    errorState={hasError}
                    module={module}
                    sequenceIndex={sequenceIndex}
                    onExpand={this.handleExpand}
                />
            );
        }
        // Show an output area if the cell contains a workflow module
        let outputArea = null;
        if (cell != null) {
            outputArea = (
                <CellOutputArea
                    activeDatasetCell={cell.activeDatasetCell}
                    module={module}
                    output={cell.output}
                    onOutputSelect={onOutputSelect}
                    onNavigateDataset={onNavigateDataset}
                    onShowAnnotations={onShowAnnotations}
                />
            );
        }
        let cellCss = 'notebook-cell';
        if (expanded) {
            if (isEmptyCell) {
                cellCss += '-xp-new';
            } else {
                cellCss += '-xp';
            }
        }
        // Add modals if the cell is not empty
        let modals = null;
        if (!isEmptyCell) {
            modals = (
                <div>
                    <EditResourceNameModal
                        isValid={isNotEmptyString}
                        open={showModal === MODAL_BRANCH}
                        prompt='Enter a name for the new branch'
                        title='Create branch'
                        onCancel={this.hideModal}
                        onSubmit={this.handleCreateBranch}
                    />
                    <DeleteResourceModal
                        open={showModal === MODAL_DELETE}
                        prompt={'Do you really want to delete the notebook cell [' + sequenceIndex + ']'}
                        title='Delete cell'
                        value={module}
                        onCancel={this.hideModal}
                        onSubmit={this.handleDeleteModule}
                    />
                </div>
            );
        }
        return (
            <div className={cellCss}>
                { inputArea }
                { outputArea }
                { modals }
            </div>
        )
    }
    /**
     * Show modal to enter new branch name.
     */
    showCreateBranchModal = () => (this.setState({showModal: MODAL_BRANCH}));
    /**
     * Show modal to delete the current module from the workflow.
     */
    showDeleteModuleModal = () => (this.setState({showModal: MODAL_DELETE}));
}

export default EditableNotebookCell;
