/**
 * A Python command cell contains a text field for the command content and a
 * submit button.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Grid, List } from 'semantic-ui-react';
import {Controlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import '../../../../../css/App.css';
import '../../../../../css/ModuleForm.css';


const CREATE_DATASET = 'CREATE_DATASET';
const DELETE_COLUMN = 'DELETE_COLUMN';
const DELETE_DATASET = 'DELETE_DATASET';
const DELETE_ROW = 'DELETE_ROW';
const GET_DATASET = 'GET_DATASET';
const INSERT_COLUMN = 'INSERT_COLUMN';
const INSERT_ROW = 'INSERT_ROW';
const NEW_DATASET_OBJECT = 'NEW_DATASET_OBJECT';
const OUTPUT_COLUMN_NAMES = 'OUTPUT_COLUMN_NAMES';
const OUTPUT_CELL_VALUES = 'OUTPUT_CELL_VALUES';
const RENAME_DATASET = 'RENAME_DATASET';
const UPDATE_CELL_VALUE = 'UPDATE_CELL_VALUE';
const UPDATE_DATASET = 'UPDATE_DATASET';


class CodeSnippetsSelector extends React.Component {
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
        if (value === CREATE_DATASET) {
            lines.push('# Create a new dataset in the data store. Expects a');
            lines.push('# dataset object and a unique dataset name.');
            lines.push('vizierdb.create_dataset(\'unique-ds-name\', ds)')
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
        } else if (value === OUTPUT_COLUMN_NAMES) {
            lines.push('# Iterate over list of dataset columns and print column name');
            lines.push('for col in ds.columns:');
            lines.push('    print col.name');
        } else if (value === OUTPUT_CELL_VALUES) {
            lines.push('# Iterate over list of dataset rows and print cell value.')
            lines.push('# Reference column by name, label (\'A\', \'B\', ...), or');
            lines.push('# column index (0, 1, ...).');
            lines.push('for row in ds.rows:');
            lines.push('    print row.get_value(\'name-label-or-index\')');
        } else if (value === RENAME_DATASET) {
            lines.push('# Rename given dataset to a new (unique) name.');
            lines.push('vizierdb.rename_dataset(\'unique-ds-name\', \'new-unique-ds-name\')');
        } else if (value === UPDATE_CELL_VALUE) {
            lines.push('# Iterate over list of dataset rows and update cell value.')
            lines.push('# Reference column by name, label (\'A\', \'B\', ...), or');
            lines.push('# column index (0, 1, ...).');
            lines.push('for row in ds.rows:');
            lines.push('    row.set_value(\'name-label-or-index\', value)');
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
                                <List.Item value={OUTPUT_COLUMN_NAMES} onClick={this.handleSelect}>
                                    <List.Content as='a'>Print Column Names</List.Content>
                                </List.Item>
                                <List.Item value={OUTPUT_CELL_VALUES} onClick={this.handleSelect}>
                                    <List.Content as='a'>Print Cell Values</List.Content>
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
        onChange: PropTypes.func.isRequired
    }
    constructor(props) {
        super(props);
        const { value } = props;
        this.state = {editorValue: value, snippetSelectorVisible: false};
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
        const  { editorValue } = this.state;
        // Get the current indent from the last line of the editor value
        let indent = '';
        let script = editorValue.split('\n');
        if (script.length > 0) {
            const lastLine = script[script.length - 1];
            let i = 0;
            while (i < lastLine.length) {
                const c = lastLine.charAt(i);
                if ((c === ' ') || (c === '\t')) {
                    i++;
                } else {
                    break;
                }
            }
            indent = lastLine.substring(0, i);
        }
        // Append the given lines to the current value of the editor (indentent
        // based on the indent of the current last line).
        let value = editorValue;
        // Insert an empty line for readability if the current script is not
        // empty.
        if (value !== '') {
            value += '\n';
        }
        for (let i = 0; i < lines.length; i++) {
            // If the current editor value is empty do not append a new line at
            // the start.
            if ((i !== 0) || (value !== '')) {
                value += '\n';
            }
            value += indent + lines[i];
        }
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
    handleChange = (value) => {
        const { id, onChange } = this.props;
        this.setState({editorValue: value});
        onChange(id, value);
    }
    /**
     * Show the code editor and optionally the code snippet selector.
     */
    render() {
        const  { editorValue, snippetSelectorVisible } = this.state;
        let headerCss = '';
        let selectorPanel = null;
        if (snippetSelectorVisible) {
            headerCss = ' expanded';
            selectorPanel = <CodeSnippetsSelector onSelect={this.appendCode}/>
        }
        return (
            <div>
                <div className='python-examples'>
                    <div className={'snippet-header' + headerCss}>
                        <Icon name='help circle' color='blue' onClick={this.toggleSnippetSelector} />
                        <span className='left-padding-sm' onClick={this.toggleSnippetSelector}>
                            Code examples for dataset manipulation
                        </span>
                    </div>
                    { selectorPanel }
                </div>
                <div className='editor-container'>
                    <CodeMirror
                        value={editorValue}
                        options={{
                            lineNumbers: true,
                            mode: 'python',
                            indentUnit: 4
                        }}
                        onBeforeChange={(editor, data, value) => {
                            this.handleChange(value);
                        }}
                        onChange={(editor, data, value) => {
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
