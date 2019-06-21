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
import { Icon, Grid, List } from 'semantic-ui-react';
import {Controlled as CodeMirror} from 'react-codemirror2'
import DatasetSelector from './DatasetSelector';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/sql/sql';
import '../../../../../css/App.css';
import '../../../../../css/ModuleForm.css';
import TextControl from './TextControl';


/**
* A Python command cell contains a text field for the command content and a
* submit button.
*/

const SELECT_TABLE = 'SELECT_TABLE';
const JOIN_TABLES = 'JOIN_TABLES';
const UNION_TABLES = 'UNION_TABLES';
const DATASET = 'DATASET';



export class SQLCodeSnippetsSelector extends React.Component {
    static propTypes = {
        onSelect: PropTypes.func.isRequired
    }
    constructor(props) {
        super(props);
        this.state = {secondaryDatasetValue: ""}
    }
    /**
     * Depending on the selected list item pass code snippet to controlling
     * elements. Assumes the the .onSelect() method expects a list of code
     * lines.
     */
    handleSelect = (e, { value }) => {
    	const { onSelect } = this.props;
    	const { secondaryDatasetValue, primaryDatasetValue } = this.state
    	let lines = [];
        if (value === SELECT_TABLE) {
            lines.push('SELECT * FROM '+primaryDatasetValue);
        } else if (value === JOIN_TABLES) {
        	lines.push('SELECT * FROM '+primaryDatasetValue+' JOIN '+secondaryDatasetValue);
        } else if (value === UNION_TABLES) {
        	lines.push('(SELECT * FROM '+primaryDatasetValue+') UNION ALL (SELECT * FROM '+secondaryDatasetValue+')');
        } else if (value === DATASET) {
            lines.push(' '+primaryDatasetValue+' ');
        }
        onSelect(lines);
    }
    handleSecondaryDatasetChange = (value) => {
        this.setState({secondaryDatasetValue: value});
    }
    handlePrimaryDatasetChange = (value) => {
        this.setState({primaryDatasetValue: value});
    }
    
    render() {
    	const { id, datasets } = this.props;
    	const { secondaryDatasetValue, primaryDatasetValue } = this.state;
    	return (
            <div className='snippet-selector'>
                <Grid columns={4} divided>
                    <Grid.Row>
                        <Grid.Column width={4} key='output'>
                            <List link>
                                <List.Item>
                                    <List.Header><Icon name='desktop' /> Access & Output</List.Header>
                                </List.Item>
                                <List.Item className='sql-example-list-item' value={SELECT_TABLE} onClick={this.handleSelect}>
                                    <List.Content as='a'>
                                       <span className='sql-example-a-span'>Select from</span>
                                       <div className='sql-example-ds-selector'>
		                		        	<DatasetSelector
		                		                key={id}
		                		                id={id}
		                		                isRequired={false}
		                		                name={id}
		                		                datasets={datasets}
		                		                value={primaryDatasetValue}
		                		                onChange={(dsselector, value) => {
		                		                	this.handlePrimaryDatasetChange(value)
		                                        }}
		                		        	/>
		                                </div>
		                		        <Icon name='plus' />
                                    </List.Content>
                                </List.Item>
                                <List.Item className='sql-example-list-item' value={JOIN_TABLES} onClick={this.handleSelect}>
	                                <List.Content as='a'>
	                                    <div className='sql-example-ds-selector'>
		                		        	<DatasetSelector
		                		                key={id}
		                		                id={id}
		                		                isRequired={false}
		                		                name={id}
		                		                datasets={datasets}
		                		                value={primaryDatasetValue}
		                		                onChange={(dsselector, value) => {
		                		                	this.handlePrimaryDatasetChange(value)
		                                        }}
		                		        	/>
		                		        </div>
		                		        <span className='sql-example-a-span'>Join</span>
		                		        <div className='sql-example-ds-selector'>
	                                        <DatasetSelector
		                		                key={id}
		                		                id={id}
		                		                isRequired={false}
		                		                name={id}
		                		                datasets={datasets}
		                		                value={secondaryDatasetValue}
		                		                onChange={(dsselector, value) => {
		                		                	this.handleSecondaryDatasetChange(value)
		                                        }}
	                		        	    />
		                		        </div>
	                                    <Icon name='plus' />
	                                </List.Content>
	                            </List.Item>
	                            <List.Item className='sql-example-list-item' value={UNION_TABLES} onClick={this.handleSelect}>
                                <List.Content as='a'>
                                    <div className='sql-example-ds-selector'>
	                		        	<DatasetSelector
	                		                key={id}
	                		                id={id}
	                		                isRequired={false}
	                		                name={id}
	                		                datasets={datasets}
	                		                value={primaryDatasetValue}
	                		                onChange={(dsselector, value) => {
	                		                	this.handlePrimaryDatasetChange(value)
	                                        }}
	                		        	/>
	                		        </div>
	                		        <span className='sql-example-a-span'>Union</span>
	                		        <div className='sql-example-ds-selector'>
	                		        	<DatasetSelector
	                		                key={id}
	                		                id={id}
	                		                isRequired={false}
	                		                name={id}
	                		                datasets={datasets}
	                		                value={secondaryDatasetValue}
	                		                onChange={(dsselector, value) => {
	                		                	this.handleSecondaryDatasetChange(value)
	                                        }}
                		        	    />
	                		        </div>
	                		        <Icon name='plus' />
                                </List.Content>
                            </List.Item>
                            </List>
                        </Grid.Column>
                        <Grid.Column width={4} key='new'>
                            <List link>
                                <List.Item>
                                    <List.Header><Icon name='plus' /> Dataset</List.Header>
                                </List.Item>
                                <List.Item className='sql-example-list-item' value={DATASET} onClick={this.handleSelect}>
                                    <List.Content as='a'>
                                        <span className='sql-example-a-span'>Dataset</span>
	                                    <div className='sql-example-ds-selector'>
		                		        	<DatasetSelector
		                		                key={id}
		                		                id={id}
		                		                isRequired={false}
		                		                name={id}
		                		                datasets={datasets}
		                		                value={primaryDatasetValue}
		                		                onChange={(dsselector, value) => {
		                		                	this.handlePrimaryDatasetChange(value)
		                                        }}
		                		        	/>
		                                </div>
		                		        <Icon name='plus' />
                                    </List.Content>
                                </List.Item>
                            </List>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        )
    }
}


class SQLCell extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        otputDataset: PropTypes.string,
        value: PropTypes.string,
        editing: PropTypes.bool.isRequired,
        sequenceIndex: PropTypes.number.isRequired,
        cursorPosition: PropTypes.object.isRequired,
        newLines: PropTypes.string,
        onChange: PropTypes.func.isRequired
    }
    constructor(props) {
        super(props);
        const { id, value, editing, sequenceIndex, cursorPosition, newLines, onChange, outputDataset } = props;
        let evalue = value;
        let addLines = false;
        let newCursorPos = cursorPosition;
        let active = (sequenceIndex === window.activeCodeCell);
        if(newLines){
        	addLines = true;
        	evalue = newLines;
        }
        else if(active && window.cursorPosition){
        	newCursorPos = window.cursorPosition;
        }
        this.state = {editorValue: evalue, snippetSelectorVisible: false, editing: editing, active:active, cursorPosition: newCursorPos, addLines:addLines, outputDataset:outputDataset };
        if(newLines){
        	onChange(id, evalue);
        }
    }
    /**
     * Append a code snippet to the current editor value. The code snippet is
     * expected to be a list of strings (code lines).
     *
     * Tries to determine the current indent from the last line tin the current
     * editor value.
     */
    appendCode = (lines) => {
    	const { id, onChange } = this.props;
        const  { editorValue, cursorPosition } = this.state;
        // Get the current indent from the last line of the editor value
        let indent = '';
        let script = editorValue.split('\n');
        if (script.length > 0 && editorValue !== '') {
            const refLine = script[cursorPosition.line];
            let i = 0;
            while (i < refLine.length) {
                const c = refLine.charAt(i);
                if ((c === ' ') || (c === '\t')) {
                    i++;
                } else {
                    break;
                }
            }
            indent = refLine.substring(0, i);
        }
        // Append the given lines to the current value of the editor (indentent
        // based on the indent of the current last line).
        for (let i = 0; i < lines.length; i++) {
            // If the current editor value is empty do not append a new line at
            // the start.
            script.splice(cursorPosition.line+i, 0, indent + lines[i]);
        }
        // Insert an empty line for readability if the current script is not
        // empty.
        if (editorValue !== '') {
        	script.splice(cursorPosition.line, 0, "");
        }

        let value = script.join("\n");
        // Update the local state and propagate the change to the conrolling
        // notebook cell
        this.setState({editorValue: value});
        onChange(id, value);
        // Hide the snippet selector
        this.toggleSnippetSelector();
    }
    /**
     * Handle changes in the code mirror editor. Keep track of the editor value
     * locally and propagate the state change to the conrolling notebook cell
     * input form..
     */
    handleChange = (editor, value, data) => {
    	const { id, onChange } = this.props;
        let cursorp = editor.getCursor();
        this.setState({editorValue: value, cursorPosition: cursorp});
        if(data.to &&  data.from && data.origin){
        	if(data.origin === '+input' || data.origin === 'paste'){
        		let newLines = data.text;
        		let newLineCount =  newLines.length -1;
        		let lastLineLength = newLines[newLineCount].length;
        		let newLine = data.from.line + newLineCount;
        	    let newCh = lastLineLength;
        	    if(newLines.length === 1){
        	    	newCh = data.from.ch + lastLineLength;
        	    }
        		cursorp = {line:newLine, ch:newCh};
        	}
        	else if(data.origin === '+delete'){
        		cursorp = {line:data.from.line, ch:data.from.ch};
        	}
        }
        window.cursorPosition = cursorp;
        onChange(id, value, cursorp);
    }
    /**
     * Handle cursor changes in the code mirror editor. Keep track of the cursor position
     * locally so that it sets properly on render.
     */
    handleCursorActivity = (editor, data) => {
    	const { active } = this.state;
        let cursorp = editor.getCursor();
        this.setState({cursorPosition: cursorp});
        if(active){
        	window.cursorPosition = cursorp;
        }
    }
    /**
     * after the component mounts set the focus if it is the active cell.
     */
    handleEditorDidMount = (editor) => {
    	const { active } = this.state;
        if(active){
        	editor.focus();
        }
    }
    /**
     * Handle change of dataset
     */
    handleDatasetChange = (value) => {
        this.setState({datasetValue: value});
    }
    /**
     * Handle change of output dataset
     */
    handleOutputDatasetChange = (value) => {
        const { onChange } = this.props;
        this.setState({outputDataset: value});
        onChange('output_dataset', value);
    }
    /**
     * Show the code editor and optionally the code snippet selector.
     */
    render() {
        const  {
            // datasetValue,
            editorValue,
            snippetSelectorVisible,
            outputDataset,
            editing,
            cursorPosition
        } = this.state;
        const { id, datasets } = this.props;
        let headerCss = '';
        let selectorPanel = null;
        let examplePanel = null;
        if (snippetSelectorVisible) {
            headerCss = ' expanded';
            selectorPanel = <SQLCodeSnippetsSelector datasets={datasets} onDatasetChange={this.handleDatasetChange} onSelect={this.appendCode}/>
        }
        if (editing) {
            examplePanel =
            	<div className='sql-examples'>
			        <div className={'snippet-header' + headerCss}>
			            <Icon name='help circle' color='blue' onClick={this.toggleSnippetSelector} />
			            <span className='left-padding-sm' onClick={this.toggleSnippetSelector}>
			                Code examples for dataset manipulation
			            </span>
			        </div>
			        { selectorPanel }
			    </div>
        }
        return (
            <div>
	            {examplePanel}
	            <div className='editor-container'>
                    <CodeMirror
                        value={editorValue}
	                    cursor={cursorPosition}
	                    options={{
                            lineNumbers: true,
                            mode: 'text/x-sql',
                            indentUnit: 4
                        }}
                        onBeforeChange={(editor, data, value) => {
                        	this.handleChange(editor, value, data);
                        }}
                        editorDidMount={(editor) => {
                        	this.handleEditorDidMount(editor)
                        }}
	                	onCursor={(editor, data) => {
	                		this.handleCursorActivity(editor, data)
	                	}}
                    />
                </div>
                <div class="ui labeled input">
	                <div class="ui label">
	                	Output Dataset
	                </div>
                    <TextControl
	                    key={id}
	                    id={id}
	                    name={'Output Dataset'}
	                    placeholder={'Output Dataset (optional)'}
	                    isRequired={false}
	                    value={outputDataset}
	                    onChange={(dstext, value) => {
		                	this.handleOutputDatasetChange(value)
	                    }}
	                />
	            </div>
            </div>
        );
    }
    toggleSnippetSelector = () => {
        const  { snippetSelectorVisible } = this.state;
        this.setState({snippetSelectorVisible: !snippetSelectorVisible});
    }
}

export default SQLCell
