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
import CellIndex from '../cell/CellIndex';
import EditResourceNameModal from '../../modals/EditResourceNameModal';
import { isNotEmptyString} from '../../../util/App';
import '../../../../css/Notebook.css';


/**
 * Input area for a read-only workflow notebook cell. The output is a
 * two-column layout. The left column contains the cell index and the
 * right column displays the module command.
 */
class ReadOnlyWorkflowCellInput extends React.Component {
    static propTypes = {
        cell: PropTypes.object.isRequired,
        errorState: PropTypes.bool.isRequired,
        sequenceIndex: PropTypes.number.isRequired,
        onCreateBranch: PropTypes.func
    }
    constructor(props) {
        super(props);
        this.state = {modalOpen: false};
    }
    /**
     * Dismiss create branch modal.
     */
    dismissModal = () => (this.setState({modalOpen: false}))
    /**
     * Submit create branch request for the module represented by this cell.
     */
    handleCreateBranch = (name) => {
        const { cell, onCreateBranch } = this.props;
        this.dismissModal();
        if (onCreateBranch != null) {
            onCreateBranch(cell.module, name);
        }
    }
    /**
     * Display create branch modal.
     */
    handleShowModal = () => (this.setState({modalOpen: true}))
    render() {
        const { cell, errorState, sequenceIndex } = this.props;
        const { modalOpen } = this.state;
        const module = cell.module;
        // Cell index is clickable to expand
        let cellIndex = null;
        // The cell command area displays the workflow module command. CSS
        // depends on whether the module is in error state or not.
        let cssPre = 'cell-cmd';
        let cssIndex = 'cell-index';
        if (errorState) {
            cssPre += '-error';
            cssIndex += '-error';
            cellIndex = (<span>[{sequenceIndex}]</span>);
        } else {
            cellIndex = (
                <CellIndex
                    onClick={this.handleShowModal}
                    cellIndex={sequenceIndex}
                    title='Create new branch at this cell'
                />
            );
        }
        let cellCommand =  (
            <pre className={cssPre}>
                {module.text}
            </pre>
        );
        // Return two-column layout
        return (
            <div>
                <table className='cell-area'><tbody>
                    <tr>
                        <td className={cssIndex}>{cellIndex}</td>
                        <td className='cell-cmd'>
                            {cellCommand}
                        </td>
                    </tr>
                </tbody></table>
                <EditResourceNameModal
                    isValid={isNotEmptyString}
                    open={modalOpen}
                    prompt='This is a read-only notebook. Enter a name to create a new branch from this cell.'
                    title='Create branch'
                    onCancel={this.dismissModal}
                    onSubmit={this.handleCreateBranch}
                />
            </div>
        );
    }
}

export default ReadOnlyWorkflowCellInput;
