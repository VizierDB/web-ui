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
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import '../../../../../css/App.css';
import '../../../../../css/ModuleForm.css';


/**
* A Python command cell contains a text field for the command content and a
* submit button.
*/

const ADD_ANNOTATION = 'ADD_ANNOTATION';
const CREATE_DATASET = 'CREATE_DATASET';
const DELETE_ANNOTATION = 'DELETE_ANNOTATION';
const DELETE_COLUMN = 'DELETE_COLUMN';
const DELETE_DATASET = 'DELETE_DATASET';
const DELETE_ROW = 'DELETE_ROW';
const GET_DATASET = 'GET_DATASET';
const GET_DATASET_FRAME = 'GET_DATASET_FRAME';
const INSERT_COLUMN = 'INSERT_COLUMN';
const INSERT_ROW = 'INSERT_ROW';
const NEW_DATASET_OBJECT = 'NEW_DATASET_OBJECT';
const OUTPUT_ANNOTATIONS = 'OUTPUT_ANNOTATIONS';
const OUTPUT_COLUMN_NAMES = 'OUTPUT_COLUMN_NAMES';
const OUTPUT_CELL_VALUES = 'OUTPUT_CELL_VALUES';
const OUTPUT_D3_PLOT = 'OUTPUT_D3_PLOT';
const OUTPUT_BOKEH_PLOT = 'OUTPUT_BOKEH_PLOT';
const OUTPUT_MAP = 'OUTPUT_MAP';
const EXPORT_MODULE = 'EXPORT_MODULE';
const RENAME_DATASET = 'RENAME_DATASET';
const UPDATE_CELL_VALUE = 'UPDATE_CELL_VALUE';
const UPDATE_ANNOTATION = 'UPDATE_ANNOTATION';
const UPDATE_DATASET = 'UPDATE_DATASET';


export class CodeSnippetsSelector extends React.Component {
    static propTypes = {
        onSelect: PropTypes.func.isRequired
    }
    /**
     * Depending on the selected list item pass code snippet to controlling
     * elements. Assumes the the .onSelect() method expects a list of code
     * lines.
     */
    handleSelect = (e, { value }) => {
        const { onSelect } = this.props;
        let lines = [];
        if (value === ADD_ANNOTATION) {
            lines.push('# Add new annotation for dataset cells. Note that rows');
            lines.push('# and columns are referenced by their unique identifiers.')
            lines.push('col = ds.columns[ds.column_index(\'name-label-or-index\')]');
            lines.push('for row in ds.rows:');
            lines.push('    annos = ds.annotations.for_cell(col.identifier, row.identifier)');
            lines.push('    if not annos.contains(\'some:key\'):');
            lines.push('        annos.add(\'some:key\', \'some-value\')');
        } else if (value === CREATE_DATASET) {
            lines.push('# Create a new dataset in the data store. Expects a');
            lines.push('# dataset object and a unique dataset name.');
            lines.push('vizierdb.create_dataset(\'unique-ds-name\', ds)')
        } else if (value === DELETE_ANNOTATION) {
            lines.push('# Delete annotations for dataset cell. Delete is similar to');
            lines.push('# update. Delete an annotation by setting its value to None.');
            lines.push('# Rows and columns are referenced by their unique identifiers.')
            lines.push('col = ds.columns[ds.column_index(\'name-label-or-index\')]');
            lines.push('for row in ds.rows:');
            lines.push('    annos = ds.annotations.for_cell(col.identifier, row.identifier)');
            lines.push('    for a in annos.find_all(\'some:key\'):');
            lines.push('        annos.update(identifier=a.identifier, value=None)');
        } else if (value === DELETE_COLUMN) {
            lines.push('# Delete dataset column by name (only if column names');
            lines.push('# are unique), spreadsheet label (\'A\', \'B\', ...), or');
            lines.push('# column index (0, 1, ...).');
            lines.push('ds.delete_column(\'name-label-or-index\')');
        } else if (value === DELETE_DATASET) {
            lines.push('# Delete dataset with the given name from data store.')
            lines.push('vizierdb.drop_dataset(\'unique-ds-name\')');
        } else if (value === DELETE_ROW) {
            lines.push('# Delete dataset rows by removing them from the list of');
            lines.push('# rows using the row index.');
            lines.push('del ds.rows[index]');
        } else if (value === GET_DATASET) {
            lines.push('# Get object for dataset with given name.');
            lines.push('ds = vizierdb.get_dataset(\'unique-ds-name\')');
        } else if (value === GET_DATASET_FRAME) {
            lines.push('# Get read-only pandas dataframe object for dataset with given name.');
            lines.push('df = vizierdb.get_dataset_frame(\'unique-ds-name\')');
        } else if (value === INSERT_COLUMN) {
            lines.push('# Create a new column with a given name. The column');
            lines.push('# position is optional.');
            lines.push('ds.insert_column(\'column-name\', position=0)');
        } else if (value === INSERT_ROW) {
            lines.push('# When inserting a row the list of values and the row');
            lines.push('# position are optional. By default row cells are None.');
            lines.push('ds.insert_row(values=[\'list-of-values-for-each-column\'], position=0)');
        } else if (value === NEW_DATASET_OBJECT) {
            lines.push('# Get object containing an empty dataset.');
            lines.push('ds = vizierdb.new_dataset()');
        } else if (value === OUTPUT_ANNOTATIONS) {
            lines.push('# Print all annotations for dataset column. Note that');
            lines.push('# rows and columns are referenced by their unique identifiers.')
            lines.push('col = ds.columns[ds.column_index(\'name-label-or-index\')]');
            lines.push('for row in ds.rows:');
            lines.push('    annos = ds.annotations.for_cell(col.identifier, row.identifier)');
            lines.push('    for key in annos.keys():');
            lines.push('        for a in annos.find_all(key):');
            lines.push('            print(a.key + \' = \' + str(a.value))');
        } else if (value === OUTPUT_COLUMN_NAMES) {
            lines.push('# Iterate over list of dataset columns and print column name');
            lines.push('for col in ds.columns:');
            lines.push('    print(col.name)');
        } else if (value === OUTPUT_CELL_VALUES) {
            lines.push('# Iterate over list of dataset rows and print cell value.')
            lines.push('# Reference column by name, label (\'A\', \'B\', ...), or');
            lines.push('# column index (0, 1, ...).');
            lines.push('for row in ds.rows:');
            lines.push('    print(row.get_value(\'name-label-or-index\'))');
        } else if (value === OUTPUT_D3_PLOT) {
            lines.push('# Generate a plot using Vizier\'s internal D3-based engine.')
            lines.push('# (Expects a dataset named `ds`)')
            lines.push('ds.show_d3_plot(\'bar_cluster\', ')
            lines.push('  labels_inner= [ \'LINE 1\',  \'LINE 2\',  \'LINE 3\'],')
            lines.push('  keys        = [ \'VALUE-1\', \'VALUE-2\', \'VALUE-3\'],')
            lines.push('  key_col     = \'KEY-COLUMN-NAME\',')
            lines.push('  value_cols  = [ \'VALUE-COL-1\', \'VALUE-COL-2\', \'VALUE-COL-3\'],')
            lines.push('  title       = \'My Plot\',')
            lines.push('  legend_title=\'Legend\'')
            lines.push(')')
        } else if (value === OUTPUT_BOKEH_PLOT) {
            lines.push('# Generate a plot using Bokeh')
            lines.push('# (Expects a dataset named `ds`)')
            lines.push('# See https://bokeh.pydata.org/en/latest/docs/reference.html')
            lines.push('from bokeh.io import show')
            lines.push('from bokeh.plotting import figure')
            lines.push('plot = figure(title = \'MyFigure\')')
            lines.push('plot.line(')
            lines.push('  x = \'X-COLUMN-NAME\', ')
            lines.push('  y = \'Y-COLUMN-NAME\', ')
            lines.push('  source = ds.to_bokeh()')
            lines.push(')')
            lines.push('show(plot)')
        } else if (value === OUTPUT_MAP) {
            lines.push('# Render an interactive OpenStreetMap with points marked')
            lines.push('# (Expects a dataset named `ds`)')
            lines.push('ds.show_map(')
            lines.push('  lat_col = \'LATITUDE-COLUMN-NAME\',')
            lines.push('  lon_col = \'LONGITUDE-COLUMN-NAME\',')
            lines.push('  label_col = \'LABEL-COLUMN-NAME\' # Optional')
            lines.push(')')
        } else if (value === EXPORT_MODULE) {
            lines.push('# Export a variable, a function or a class for use in subsequent cells')
            lines.push('def add_numbers(number_1, number_2):')
            lines.push('    print(\'adding \' + str(number_1) + \' + \' +str(number_2))')
            lines.push('    return number_1 + number_2')
            lines.push('vizierdb.export_module(')
            lines.push('    add_numbers')
            lines.push(')')
            lines.push('#  Use it in a subsequent like normal: add_numbers(1,2)')
        } else if (value === RENAME_DATASET) {
            lines.push('# Rename given dataset to a new (unique) name.');
            lines.push('vizierdb.rename_dataset(\'unique-ds-name\', \'new-unique-ds-name\')');
        } else if (value === UPDATE_CELL_VALUE) {
            lines.push('# Iterate over list of dataset rows and update cell value.')
            lines.push('# Reference column by name, label (\'A\', \'B\', ...), or');
            lines.push('# column index (0, 1, ...).');
            lines.push('for row in ds.rows:');
            lines.push('    row.set_value(\'name-label-or-index\', value)');
        } else if (value === UPDATE_ANNOTATION) {
            lines.push('# Update all annotations for dataset cell. Note that');
            lines.push('# rows and columns are referenced by their unique identifiers.')
            lines.push('col = ds.columns[ds.column_index(\'name-label-or-index\')]');
            lines.push('for row in ds.rows:');
            lines.push('    annos = ds.annotations.for_cell(col.identifier, row.identifier)');
            lines.push('    for a in annos.find_all(\'some:key\'):');
            lines.push('        annos.update(identifier=a.identifier, value=\'some-value\')');
        } else if (value === UPDATE_DATASET) {
            lines.push('# Update existing dataset with given name.');
            lines.push('vizierdb.update_dataset(\'unique-ds-name\', ds)');
        }
        onSelect(lines);
    }
    render() {
        return (
            <div className='snippet-selector'>
                <Grid columns={4} divided>
                    <Grid.Row>
                        <Grid.Column width={4} key='output'>
                            <List link>
                                <List.Item>
                                    <List.Header><Icon name='desktop' /> Access & Output</List.Header>
                                </List.Item>
                                <List.Item value={GET_DATASET} onClick={this.handleSelect}>
                                    <List.Content as='a'>Get Dataset</List.Content>
                                </List.Item>
                                <List.Item value={GET_DATASET_FRAME} onClick={this.handleSelect}>
	                                <List.Content as='a'>Get Dataset Dataframe</List.Content>
	                            </List.Item>
                                <List.Item value={OUTPUT_COLUMN_NAMES} onClick={this.handleSelect}>
                                    <List.Content as='a'>Print Column Names</List.Content>
                                </List.Item>
                                <List.Item value={OUTPUT_CELL_VALUES} onClick={this.handleSelect}>
                                    <List.Content as='a'>Print Cell Values</List.Content>
                                </List.Item>
                                <List.Item value={OUTPUT_ANNOTATIONS} onClick={this.handleSelect}>
                                    <List.Content as='a'>Print Cell Annotations</List.Content>
                                </List.Item>
                                <List.Item value={OUTPUT_D3_PLOT} onClick={this.handleSelect}>
	                                <List.Content as='a'>Output Plot (D3)</List.Content>
	                            </List.Item>
                                <List.Item value={OUTPUT_BOKEH_PLOT} onClick={this.handleSelect}>
                                    <List.Content as='a'>Output Plot (Bokeh)</List.Content>
                                </List.Item>
                                <List.Item value={OUTPUT_MAP} onClick={this.handleSelect}>
                                    <List.Content as='a'>Output Map</List.Content>
                                </List.Item>
                                <List.Item value={EXPORT_MODULE} onClick={this.handleSelect}>
                                    <List.Content as='a'>Export Module</List.Content>
                                </List.Item>
                            </List>
                        </Grid.Column>
                        <Grid.Column width={4} key='new'>
                            <List link>
                                <List.Item>
                                    <List.Header><Icon name='plus' /> New</List.Header>
                                </List.Item>
                                <List.Item value={NEW_DATASET_OBJECT} onClick={this.handleSelect}>
                                    <List.Content as='a'>New Dataset Object</List.Content>
                                </List.Item>
                                <List.Item value={INSERT_COLUMN} onClick={this.handleSelect}>
                                    <List.Content as='a'>Insert Column</List.Content>
                                </List.Item>
                                <List.Item value={INSERT_ROW} onClick={this.handleSelect}>
                                    <List.Content as='a'>Insert Row</List.Content>
                                </List.Item>
                                <List.Item value={ADD_ANNOTATION} onClick={this.handleSelect}>
                                    <List.Content as='a'>Annotate Cell Value</List.Content>
                                </List.Item>
                            </List>
                        </Grid.Column>
                        <Grid.Column width={4} key='update'>
                            <List link>
                                <List.Item>
                                    <List.Header><Icon name='edit' /> Update</List.Header>
                                </List.Item>
                                <List.Item value={UPDATE_CELL_VALUE} onClick={this.handleSelect}>
                                    <List.Content as='a'>Edit Cell Values</List.Content>
                                </List.Item>
                                <List.Item value={UPDATE_ANNOTATION} onClick={this.handleSelect}>
                                    <List.Content as='a'>Update Cell Annotations</List.Content>
                                </List.Item>
                                <List.Item value={UPDATE_DATASET} onClick={this.handleSelect}>
                                    <List.Content as='a'>Save Dataset</List.Content>
                                </List.Item>
                                <List.Item value={CREATE_DATASET} onClick={this.handleSelect}>
                                    <List.Content as='a'>Save Dataset As ...</List.Content>
                                </List.Item>
                                <List.Item value={RENAME_DATASET} onClick={this.handleSelect}>
                                    <List.Content as='a'>Rename Dataset</List.Content>
                                </List.Item>
                            </List>
                        </Grid.Column>
                        <Grid.Column width={4} key='delete'>
                            <List link>
                                <List.Item>
                                    <List.Header><Icon name='trash' /> Delete</List.Header>
                                </List.Item>
                                <List.Item value={DELETE_DATASET} onClick={this.handleSelect}>
                                    <List.Content as='a'>Delete Dataset</List.Content>
                                </List.Item>
                                <List.Item value={DELETE_COLUMN} onClick={this.handleSelect}>
                                    <List.Content as='a'>Delete Dataset Column</List.Content>
                                </List.Item>
                                <List.Item value={DELETE_ROW} onClick={this.handleSelect}>
                                    <List.Content as='a'>Delete Dataset Row</List.Content>
                                </List.Item>
                                <List.Item value={DELETE_ANNOTATION} onClick={this.handleSelect}>
                                    <List.Content as='a'>Delete Cell Annotations</List.Content>
                                </List.Item>
                            </List>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        )
    }
}

class PythonCell extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        value: PropTypes.string,
        editing: PropTypes.bool.isRequired,
        cursorPosition: PropTypes.object.isRequired,
        newLines: PropTypes.string,
        onChange: PropTypes.func.isRequired
    }
    constructor(props) {
        super(props);
        const { id, value, editing, cursorPosition, newLines, onChange } = props;
        let evalue = value;
        let addLines = false;
        let newCursorPos = cursorPosition;
        let active = (id === window.activeCodeCell || window.activeCodeCell == null);
        if(newLines){
        	addLines = true;
        	evalue = newLines;
        }
        else if(active && window.cursorPosition){
        	newCursorPos = window.cursorPosition;
        }
        this.state = {editorValue: evalue, snippetSelectorVisible: false, editing: editing, active:active, cursorPosition: newCursorPos, addLines:addLines};
        if(addLines){
        	onChange(id, evalue);
        }
    }
    /**
     * Append a code snippet to the current editor value. The code snippet is
     * expected to be a list of strings (code lines).
     *
     * Tries to determine the current indent from the last line in the current
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
        	    if(newLines.length === 1) {
        	    	newCh = data.from.ch + lastLineLength;
        	    }
        		cursorp = {line:newLine, ch:newCh};
        	}
        	else if(data.origin === '+delete') {
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
     * Show the code editor and optionally the code snippet selector.
     */
    render() {
        const  {
            editorValue,
            snippetSelectorVisible,
            editing,
            active,
            cursorPosition
        } = this.state;
        let headerCss = '';
        let selectorPanel = null;
        let examplePanel = null;
        let editorContainerCss = active ? '' : ' collapsed'
        if (snippetSelectorVisible) {
            headerCss = ' expanded';
            selectorPanel = <CodeSnippetsSelector onSelect={this.appendCode}/>
        }
        if (editing) {
            examplePanel =
            	<div className='python-examples'>
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
                <div className={'editor-container' + editorContainerCss }>
                    <CodeMirror
                        value={editorValue}
	                    cursor={cursorPosition}
                        options={{
                            lineNumbers: true,
                            mode: 'python',
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
            </div>
        );
    }
    toggleSnippetSelector = () => {
        const  { snippetSelectorVisible } = this.state;
        this.setState({snippetSelectorVisible: !snippetSelectorVisible});
    }
}

export default PythonCell
