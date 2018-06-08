import React from 'react';
import { PropTypes } from 'prop-types';
import CellIndex from './CellIndex';
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
                    sequenceIndex={sequenceIndex}
                    title='Create new branch unitl here'
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
