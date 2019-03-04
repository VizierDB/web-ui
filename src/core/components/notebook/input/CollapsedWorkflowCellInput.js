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
import '../../../../css/Notebook.css'
import { Form } from 'semantic-ui-react';
import PythonCell from './form/PythonCell';
import SQLCell from './form/SQLCell';
import ScalaCell from './form/ScalaCell';
import { DT_PYTHON_CODE, DT_SQL_CODE, DT_SCALA_CODE } from './ModuleSpec';

/**
 * Collapsed input area for an workflow notebook cell. The output is a
 * two-column layout. The left column contains a clickable cell index and the
 * right column displays the module command.
 */
class CollapsedWorkflowCellInput extends React.Component {
    static propTypes = {
        errorState: PropTypes.bool.isRequired,
        module: PropTypes.object.isRequired,
        command: PropTypes.object.isRequired,
        sequenceIndex: PropTypes.number.isRequired,
        codeEditorProps: PropTypes.object.isRequired,
        onExpand: PropTypes.func.isRequired,
        onExpandCode: PropTypes.func.isRequired
    }
    render() {
        const { errorState, module, command, sequenceIndex, codeEditorProps, onExpand, onExpandCode } = this.props;
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
        let cellCommand =  null;
        if(command.id === "CODE"){
    		const args = command.arguments
    		const srcvalue = module.command.arguments[0].value
        	if ((args.length === 1) && (args[0].datatype === DT_PYTHON_CODE)) {
                const arg = args[0];
                return (
                	<table className='cell-area'><tbody>
                        <tr>
                            <td className='cell-index'>{cellIndex}</td>
                            <td className='cell-cmd'>
                            	<Form>
		                        	<PythonCell
		                                key={arg.id}
		                                id={arg.id}
		                                name={arg.id}
		                                value={srcvalue}
			                            editing={false}
		                            	sequenceIndex={codeEditorProps.sequenceIndex}
				                        cursorPosition={codeEditorProps.cursorPosition}
			                            onChange={onExpandCode}
		                            />
		                        </Form>
			                </td>
		                </tr>
		            </tbody></table>
                );
            }
            else if ((args.length === 2) && (args[0].datatype === DT_SQL_CODE)) {
            	const srcarg = args[0];
            	const srcvalue = module.command.arguments[0].value
            	const odsvalue = module.command.arguments[1].value
                return (
                	<table className='cell-area'><tbody>
                        <tr>
                            <td className='cell-index'>{cellIndex}</td>
                            <td className='cell-cmd'>
	                            <Form>
			                        <SQLCell
		                                key={srcarg.id}
		                                id={srcarg.id}
		                                name={srcarg.id}
		                            	datasets={module.datasets}
		                                value={srcvalue}
			                            editing={false}
		                            	sequenceIndex={codeEditorProps.sequenceIndex}
				                        cursorPosition={codeEditorProps.cursorPosition}
			                            outputDataset={odsvalue}
		                                onChange={onExpandCode}
		                            />
		                        </Form>
			                </td>
		                </tr>
		            </tbody></table>
                );
            }
            else if ((args.length === 1) && (args[0].datatype === DT_SCALA_CODE)) {
            	const arg = args[0];
            	const srcvalue = module.command.arguments[0].value
            	return (
            		<table className='cell-area'><tbody>
                        <tr>
                            <td className='cell-index'>{cellIndex}</td>
                            <td className='cell-cmd'>
                            	<Form>
			                        <ScalaCell
			    		                    key={arg.id}
					                    id={arg.id}
					                    name={arg.id}
					                    value={srcvalue}
			    	                    editing={false}
				                    	sequenceIndex={codeEditorProps.sequenceIndex}
				                        cursorPosition={codeEditorProps.cursorPosition}
			                            onChange={onExpandCode}
					                />
			                    </Form>
			                </td>
		                </tr>
		            </tbody></table>
            );
            }
    	}
    	else {
    		cellCommand = (
	            <pre className={css} onDoubleClick={onExpand}>
	                {module.text}
	            </pre>
	        );
	    }
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
