import React from 'react';
import { PropTypes } from 'prop-types';
import CellIndex from './CellIndex';
import '../../../../css/Notebook.css'


/**
 * Collapsed input area for an workflow notebook cell. The output is a
 * two-column layout. The left column contains a clickable cell index and the
 * right column displays the module command.
 */
class CollapsedWorkflowCellInput extends React.Component {
    static propTypes = {
        errorState: PropTypes.bool.isRequired,
        module: PropTypes.object.isRequired,
        sequenceIndex: PropTypes.number.isRequired,
        onExpand: PropTypes.func.isRequired
    }
    render() {
        const { errorState, module, sequenceIndex, onExpand } = this.props;
        // Cell index is clickable to expand
        let cellIndex = (
            <CellIndex onClick={onExpand} sequenceIndex={sequenceIndex} />
        );
        // The cell command area displays the workflow module command. CSS
        // depends on whether the module is in error state or not.
        let css = 'cell-cmd';
        if (errorState) {
            css += '-error';
        }
        let cellCommand =  (
            <pre className={css} onDoubleClick={onExpand}>
                {module.text}
            </pre>
        );
        // Return two-column layout
        return (
            <table className='cell-area'><tbody>
                <tr>
                    <td className='cell-index'>{cellIndex}</td>
                    <td className='cell-cmd'>
                        {cellCommand}
                    </td>
                </tr>
            </tbody></table>
        );
    }
}

export default CollapsedWorkflowCellInput;
