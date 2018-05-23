/**
 * A Python command cell contains a text field for the command content and a
 * submit button.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Grid, List } from 'semantic-ui-react';
import CodeMirror from 'react-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/python/python'
import '../../../../../css/App.css';
import '../../../../../css/ModuleForm.css';


class CodeSnippetsSelector extends React.Component {
    static propTypes = {
        onClick: PropTypes.func.isRequired
    }
    handleSelect = (e, { value }) => {
        const { onClick } = this.props;
        onClick(value);
    }
    render() {
        return (
            <div className='snippet-selector'>
                <Grid columns={4} divided>
                    <Grid.Row>
                        <Grid.Column width={4} key='output'>
                            <List link>
                                <List.Item>
                                    <List.Header><Icon name='desktop' /> Output</List.Header>
                                </List.Item>
                                <List.Item value='OUTPUT_COLUMN_NAMES' onClick={this.handleSelect}>
                                    <List.Content as='a'>Print Column Names</List.Content>
                                </List.Item>
                                <List.Item value='OUTPUT_CELL_VALUES' onClick={this.handleSelect}>
                                    <List.Content as='a'>Print Cell Values</List.Content>
                                </List.Item>
                            </List>
                        </Grid.Column>
                        <Grid.Column width={4} key='new'>
                            <List link>
                                <List.Item>
                                    <List.Header><Icon name='plus' /> New</List.Header>
                                </List.Item>
                                <List.Item value='NEW_DATASET_OBJECT' onClick={this.handleSelect}>
                                    <List.Content as='a'>Get New Dataset Object</List.Content>
                                </List.Item>
                                <List.Item value='INSERT_COLUMN' onClick={this.handleSelect}>
                                    <List.Content as='a'>Insert Column</List.Content>
                                </List.Item>
                                <List.Item value='INSERT_ROW' onClick={this.handleSelect}>
                                    <List.Content as='a'>Insert Row</List.Content>
                                </List.Item>
                            </List>
                        </Grid.Column>
                        <Grid.Column width={4} key='update'>
                            <List link>
                                <List.Item>
                                    <List.Header><Icon name='edit' /> Update</List.Header>
                                </List.Item>
                                <List.Item value='UPDATE_CELL_VALUE' onClick={this.handleSelect}>
                                    <List.Content as='a'>Update Cell Value</List.Content>
                                </List.Item>
                                <List.Item value='UPDATE_DATASET' onClick={this.handleSelect}>
                                    <List.Content as='a'>Update Existing Dataset</List.Content>
                                </List.Item>
                                <List.Item value='CREATE_DATASET' onClick={this.handleSelect}>
                                    <List.Content as='a'>Save As New Dataset</List.Content>
                                </List.Item>
                                <List.Item value='RENAME_DATASET' onClick={this.handleSelect}>
                                    <List.Content as='a'>Rename Dataset</List.Content>
                                </List.Item>
                            </List>
                        </Grid.Column>
                        <Grid.Column width={4} key='delete'>
                            <List link>
                                <List.Item>
                                    <List.Header><Icon name='trash' /> Delete</List.Header>
                                </List.Item>
                                <List.Item value='DELETE_DATASET' onClick={this.handleSelect}>
                                    <List.Content as='a'>Delete Dataset</List.Content>
                                </List.Item>
                                <List.Item value='DELETE_COLUMN' onClick={this.handleSelect}>
                                    <List.Content as='a'>Delete Dataset Column</List.Content>
                                </List.Item>
                                <List.Item value='DELETE_ROW' onClick={this.handleSelect}>
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
        this.state = {snippetSelector: false};
    }
    appendCode = (code) => {
        const { id, onChange } = this.props;
        onChange(id, code);
        this.toggleSnippetSelector();
    }
    handleChange = (value) => {
        const { id, onChange } = this.props;
        onChange(id, value);
    }
    render() {
        const { value } = this.props;
        const  { snippetSelector } = this.state;
        let headerCss = '';
        let selectorPanel = null;
        if (snippetSelector) {
            headerCss = ' expanded';
            selectorPanel = <CodeSnippetsSelector onClick={this.appendCode}/>
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
                        value={value}
                        onChange={this.handleChange}
                        options={{
                            lineNumbers: true,
                            mode: 'python',
                            indentUnit: 4
                        }}
                    />
                </div>
            </div>
        );
    }
    toggleSnippetSelector = () => {
        const  { snippetSelector } = this.state;
        this.setState({snippetSelector: !snippetSelector});
    }
}

export default PythonCell
