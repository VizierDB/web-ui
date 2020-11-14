/**
 * Copyright (C) 2018-2019 New York University
 *                         University at Buffalo,
 *                         Illinois Institute of Technology.
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
import { HotKeys } from 'react-hotkeys';
import { Button, Form } from 'semantic-ui-react';
import CommandsListing from './CommandsListing';
import ContentSpinner from '../../ContentSpinner';
import CodeCell from './form/CodeCell'
import TextControl from './form/TextControl';
import { ErrorListMessage } from '../../Message';
import ModuleInputForm from './ModuleInputForm';
import { CodeSnippetsSelector as PythonSnippets } from './form/PythonCell';
import { ScalaCodeSnippetsSelector as ScalaSnippets } from './form/ScalaCell';
import { RCodeSnippetsSelector as RSnippets } from './form/RCell';
import { SQLCodeSnippetsSelector as SQLSnippets } from './form/SQLCell';
import { MarkdownCodeSnippetsSelector as MarkdownSnippets } from './form/MarkdownCell';
import { DT_DATASET_ID, formValuesToRequestData, toFormValues,
    resetColumnIds } from '../../../resources/Engine';
import '../../../../css/App.css';
import '../../../../css/ModuleForm.css';

/**
 * The moule input area is divided into three parts: (i) a header that contains
 * a dropdown menu to select one of the available module commands, (2) the
 * command input form, and (3) buttons to sumbit or dismiss the module changes.
 */
class CellCommandArea extends React.Component {
    static propTypes = {
        apiEngine: PropTypes.object.isRequired,
        datasets: PropTypes.array.isRequired,
        cell: PropTypes.object.isRequired,
        isActiveCell: PropTypes.bool.isRequired,
        onClick: PropTypes.func.isRequired,
        onDismiss: PropTypes.func.isRequired,
        onSelectCell: PropTypes.func.isRequired,
        onSubmit: PropTypes.func,
        userSettings: PropTypes.object.isRequired,
        onResetRecommendations: PropTypes.func,
        onUpdateProgress: PropTypes.func
    }
    constructor(props) {
        super(props);
        const { cell, datasets } = props;
        // Keep track of the command specification that is currently being
        // selected. For an existing cell the specification initially is the one
        // that is contained in the workflow module handle. For new cells the
        // command specification is undefined or null. If the user selects a
        // new command from the command menu the local state will be updated
        // accordingly.
        // If the cell contains a code editor maintain information about the
        // cursor position and a list of new lines that are being pasted from
        // a code-snippet selector
        let values = null;
        if (!cell.isNewCell()) {
            values = toFormValues(
                cell.commandSpec.parameters,
                datasets,
                cell.module.command.arguments
            );
        }
        this.state = {
            codeEditorProps: {
                cursorPosition: { line: 0, ch: 0 },
                newLines: ""
            },
            errors: null,
            formValues: values,
            hasErrors: false,
            selectedCommand: cell.commandSpec,
            showCommandsListing: (cell.commandSpec == null),
            snippetSelectorVisible: false,
            upstreamFormValues: false,
            submitted: false
        }
    }
    /**
     * Set this as the active cell (if it isn't yet). This method is intended
     * when a rebdered code editor receives the focus.
     */
    handleActivateCell = () => {
        const { cell, isActiveCell, onSelectCell } = this.props;
        if (!isActiveCell) {
            onSelectCell(cell);
        }
    }
    /**
     * Append a code snippet to the current editor value. The code snippet is
     * expected to be a list of strings (code lines).
     *
     * Tries to determine the current indent from the last line in the current
     * editor value.
     */
    handleAppendCode = (lines) => {
        const  { codeEditorProps, formValues, selectedCommand } = this.state;
        const paraCode = selectedCommand.codeParameter;
        const editorValue = formValues[paraCode.id] == null ? '' : formValues[paraCode.id];
        const cursorPosition = codeEditorProps.cursorPosition;
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
        this.handleFormValueChange(paraCode.id, value);
        // Hide the snippet selector
        this.handleToggleSnippetSelector();
    }
    /**
     * Handle change in one of the elements in a displayed module input form.
     * If the cell displays a code editor the optional cursorPosition specifies
     * the new position of the cursor in the editor.
     */
    handleFormValueChange = (id, value, cursorPosition) => {
        if(id==="bulk"){
            this.handleBulkFormValueChange(value)
            return
        }
        const { codeEditorProps, formValues, selectedCommand } = this.state;
        const modifiedValues = {...formValues};
        modifiedValues[id] = value;
        // If the modified control is a dataset selector we need to reset all
        // column identifier controls.
        const cntrlSpec = selectedCommand.parameters.find((p) => (p.id === id));
        if (cntrlSpec.datatype === DT_DATASET_ID) {
            resetColumnIds(modifiedValues, selectedCommand.parameters);
        }
        let modifiedEditorProps = null;
        if (cursorPosition != null) {
            modifiedEditorProps = { cursorPosition: cursorPosition };
        } else {
            modifiedEditorProps = codeEditorProps;
        }
        this.setState({
            upstreamFormValues: true,
            formValues: modifiedValues,
            codeEditorProps: modifiedEditorProps
        });
    }

    /**
    * Bulk update the cell state - necessary when multiple values need to be updated quickly in succession
    * (e.g. when changing tabs in the load dataset form, all properties will be updated). Individually updating
    * each attribute in a loop does not guarantee a synchronous operation as calls maybe batched for for performance
    * gains. Read More: https://reactjs.org/docs/react-component.html#setstate
    */
    handleBulkFormValueChange = (values) => {
        const modifiedValues = {...values}
        this.setState({
            formValues: modifiedValues,
            upstreamFormValues: true
        })
    }
    /**
     * Keep track of the cursor position of a displayed code cell.

     */
    handleCursorChange = (cursorPos) => {
        this.setState({ codeEditorProps: { cursorPosition: cursorPos } });
    }
    /**
     * Dismiss changes to the cell when the user presses the Dismiss button.
     * If this is a new cell the dismissal will remove the cell from the
     * notebook. Otherwise we need to adjust some of the internal state settings
     * for a fresh start when the cell becomes the active cell again.
     */
    handleDismiss = () => {
        const { cell, datasets, onDismiss } = this.props;
        // Clean up for fresh start when cell becomes active again
        if (!cell.isNewCell()) {
            this.setState({
                upstreamFormValues: false,
                formValues: toFormValues(
                    cell.commandSpec.parameters,
                    datasets,
                    cell.module.command.arguments
                ),
                selectedCommand: cell.commandSpec,
                snippetSelectorVisible: false
            });
        }
        onDismiss(cell);
    }
    /**
     * Event handler for dismissing a shown command listing. The result depends
     * on whether the cell currently has a selected command or not. In the
     * latter case this is a new cell that is empty and we call the cell dismiss
     * method.
     */
    handleDismissCommandsListing = () => {
        const { selectedCommand } = this.state;
        const { onResetRecommendations } = this.props;
        if (selectedCommand != null) {
            this.setState({showCommandsListing: false});
        } else {
            this.handleDismiss();
        }
        onResetRecommendations()
    }
    /**
     * Clear the list of error messages.
     */
    handleDismissErrors = () => {
        this.setState({errors: null});
    }
    /**
     * Set the command in the user settings clipboard as the selected command.
     */
    handlePasteCommand = () => {
        const { datasets, userSettings, onResetRecommendations} = this.props;
        this.setState({
            formValues: toFormValues(
                userSettings.clipboard.commandSpec.parameters,
                datasets,
                userSettings.clipboard.arguments
            ),
            selectedCommand: userSettings.clipboard.commandSpec,
            showCommandsListing: false
        });
        onResetRecommendations()
    }
    /**
     * Update the selected command to the command that is identified by the
     * given pair of package and command identifier.
     */
    handleSelectCommand = (packageId, commandId) => {
        const { apiEngine, datasets, onResetRecommendations} = this.props;
        const cmd = apiEngine.packages.getCommandSpec(packageId, commandId);
        this.setState({
            formValues: toFormValues(cmd.parameters, datasets),
            selectedCommand: cmd,
            showCommandsListing: false
        });
        onResetRecommendations()
    }
    /**
     * Set the showCommandsListing to true to show a list of available commands.
     */
    handleShowCommandsListing = () => {
        this.setState({showCommandsListing: true});
    }
    /**
     * Submit the values in the module input form. This method first converts
     * the forma values into the representation that is expected by the API.
     * During this conversion the input values are validated against the
     * constraints in the command specification. If any of the values are not
     * valid the form is not submitted but a list of validation errors will be
     * shown instead.
     */
    handleSubmitForm = () => {
        const { cell, onSubmit, apiEngine, onUpdateProgress } = this.props;
        // The onSubmit function may be none if submission is not permitted for
        // an active notebook. Show an alert for the user.
        if (onSubmit == null) {
            alert('Cannot submit cell in an active notebook');
            return;
        }
        const { formValues, selectedCommand } = this.state;
        // Convert form values into format expected by the API. During the
        // conversion validate the form values.
        const req = formValuesToRequestData(formValues, selectedCommand.parameters, apiEngine.serviceProperties);
        if (req.errors.length > 0) {
            // Show list of error messages if validation of form values failed
            this.setState({errors: req.errors, hasErrors: true});
        } else {
            // Clear the error state and submit the cell, command specification
            // and form values to update the underlying workflow.
            this.setState({errors: null, hasErrors: false, submitted:true});
            onSubmit(cell, selectedCommand, req.data, onUpdateProgress);
        }
        this.setState({upstreamFormValues:false})
    }
    /**
     * Toggle visibility of an optional code snippet selector.
     */
    handleToggleSnippetSelector = () => {
        const { snippetSelectorVisible } = this.state;
        this.setState({snippetSelectorVisible: !snippetSelectorVisible});
    }

    /**
     * Catches F5 (page refresh) and executes the cell
     */
    handleF5Press = (event) => {
        event.preventDefault()
        this.handleSubmitForm()
    }

    /**
     * To let arguments be modified by cell execution
     */
    static getDerivedStateFromProps(props, state){
        const moduleArguments = (typeof props.cell.module !== "undefined") ? props.cell.module.command.arguments : null;
        if(typeof moduleArguments !== "undefined" && moduleArguments !== null && state.upstreamFormValues === false){
            let formattedModuleArguments = toFormValues(props.cell.commandSpec.parameters, props.datasets, moduleArguments)
            return {
                ...state,
                formValues : formattedModuleArguments
            };
        }
        return null;
    }

    render() {
        const {
            apiEngine,
            cell,
            datasets,
            isActiveCell,
            onClick,
            onSubmit,
            userSettings,
        } = this.props;
        const {
            errors,
            formValues,
            hasErrors,
            selectedCommand,
            showCommandsListing,
            snippetSelectorVisible,
            submitted
        } = this.state;
        // Show an list of error messages if the form did not validate
        let errorMessage = null;
        if (errors != null) {
            errorMessage = (
                <ErrorListMessage
                    title='There are errors in the form'
                    errors={errors}
                    onDismiss={this.handleDismissErrors}
                />
            );
        }
        // The main content depends on whether a command specification is
        // defined for the associated notebook cell or not.
        let mainContent = null;
        // For code cells with additional parameters
        let additionalParams = null;
        // For code cells an additional button is shown to toggle vizibility of
        // a code snippet selector.
        let codeSnippetButton = null;
        if ((isActiveCell) && ((selectedCommand == null) || (showCommandsListing))) {
            let onPaste = null;
            if (userSettings.clipboard != null) {
                onPaste = this.handlePasteCommand;
            }
            // If the command specification is undefined or the show command listing
            // flag is true then a listing of all available commands is shown to allow
            // the user to select a command.
            mainContent = (
                <CommandsListing
                    apiEngine={apiEngine}
                    onDismiss={this.handleDismissCommandsListing}
                    onPaste={onPaste}
                    onSelect={this.handleSelectCommand} />
            );
        } else {
            // If there is a command specification defined for this component
            // the output depends on whether (i) the command is a code cell
            // command and (2) the cell is in edit state or not.
            let paraCode = null;
            if (isActiveCell) {
                paraCode = selectedCommand.codeParameter;
            } else if (!cell.isNewCell()) {
                paraCode = cell.commandSpec.codeParameter;
            }
            if (paraCode != null) {
            	if (submitted) {
                    // cell has been submitted but not put/post not done yet
                    mainContent = (
                        <div className={'module-form'}>
                           <ContentSpinner text="Submitting Cell" size='small' />
                        </div>
                    );
                }
            	else{
	            	// Show (optional) code snippet selector for different code cell
	                // types. The snippet selector is only visible if this is the
	                // active cell and the show snippet flag is true.
	                let codeSnippetPanel = null;
	                if ((isActiveCell) && (snippetSelectorVisible)) {
	                    if (paraCode.language === 'python') {
	                        codeSnippetPanel = (
	                            <PythonSnippets onSelect={this.handleAppendCode}/>
	                        );
	                    } else if (paraCode.language === 'scala') {
	                        codeSnippetPanel = (
	                            <ScalaSnippets onSelect={this.handleAppendCode}/>
	                        );
	                    } else if (paraCode.language === 'r') {
	                    	codeSnippetPanel = (
	                            <RSnippets onSelect={this.handleAppendCode}/>
	                        );
	                    } else if (paraCode.language === 'sql') {
	                        // let outputDataset = formValues['output_dataset'];
	                    	codeSnippetPanel = (
	                                <SQLSnippets datasets={datasets} onSelect={this.handleAppendCode}/>
	                            );
	                    }
	                    else if (paraCode.language === 'markdown') {
	                        codeSnippetPanel = (
	                                <MarkdownSnippets onSelect={this.handleAppendCode}/>
	                            );
	                    }
	
	                }
	                const { codeEditorProps } = this.state;
	                if((isActiveCell) && (paraCode.language === 'sql')) {
	                	let outputDataset = formValues['output_dataset'];
	                	additionalParams = (
	                    		<div class="ui labeled input">
					                <div class="ui label">
					                	Output Dataset
					                </div>
				                    <TextControl
					                    key={paraCode.id}
					                    id={paraCode.id}
					                    name={'Output Dataset'}
					                    placeholder={'Output Dataset (optional)'}
					                    isRequired={false}
					                    value={outputDataset}
					                    onChange={(dstext, value) => {
					                    	this.handleFormValueChange('output_dataset', value, codeEditorProps.cursorPosition)
					                    }}
					                />
					            </div>
		                    );
	                }
	                mainContent = (
	                    <div>
	                        <Form>
	                            <CodeCell
	                                cursorPosition={codeEditorProps.cursorPosition}
	                                editing={false}
	                                id={paraCode.id}
	                                isActiveCell={isActiveCell}
	                                key={paraCode.id}
	                                language={paraCode.language}
	                                onChange={this.handleFormValueChange}
	                                onCursor={this.handleCursorChange}
	                                onFocus={this.handleActivateCell}
	                                readOnly={onSubmit == null}
	                                value={formValues[paraCode.id]}
	                            />
	                        </Form>
	                    { additionalParams }
	                    { codeSnippetPanel }
	                    </div>
	                );
	                // The snippet toggle button text depends on whether the snippet
	                // selector is vizible or not
	                const buttonTitle = (snippetSelectorVisible) ? 'Hide' : 'Show';
	                codeSnippetButton = (
	                    <Button
	                        content={ buttonTitle + '  Code Examples' }
	                        icon='info'
	                        labelPosition='left'
	                        primary
	                        onClick={this.handleToggleSnippetSelector}
	                    />
	                );
                }
            } else if (isActiveCell) {
            	const errorCss = (hasErrors) ? ' error' : '';
                if (submitted) {
                    // cell has been submitted but not put/post not done yet
                    mainContent = (
                        <div className={'module-form' + errorCss}>
                           <ContentSpinner text="Submitting Cell" size='small' />
                        </div>
                    );
                }
            	else{
	            	mainContent = (
	                    <div className={'module-form' + errorCss}>
	                        <p className={'module-form-header' + errorCss}>
	                            {selectedCommand.name}
	                        </p>
	                        <ModuleInputForm
	                            datasets={datasets}
	                            onChange={this.handleFormValueChange}
	                            selectedCommand={selectedCommand}
	                            serviceProperties={apiEngine.serviceProperties}
	                            values={formValues}
	                        />
	                    </div>
	                );
            	}
            } else if ((cell.isNewCell())  && (selectedCommand != null)) {
                mainContent = (
                    <pre className='cell-cmd-text' onClick={onClick}>
                        {selectedCommand.name}
                    </pre>
                );
            } else if (cell.module != null) {
                // If the cell is not a code cell, it is not being edited, and
                // it is not a new cell then the cell has to have an associated
                // workflow module. In this case we show the command text.
                mainContent = (
                    <pre className='cell-cmd-text' onClick={onClick}>
                        {cell.module.text}
                    </pre>
                );
            } 
        }
        // Wrap main content in hotkey handler if submission of the form is
        // allowed
        let wrappedContent = null;
        if (onSubmit != null) {
            // Set hotkey handler to submit and dismiss a shown command input
            // form.
            const handlers = {
              'runCell': this.handleSubmitForm,
              'dismiss': this.handleDismiss,
              'catchF5': this.handleF5Press
            };
            const keyMap = { runCell: 'ctrl+enter', dismiss: 'esc', catchF5: 'f5' };
            wrappedContent = (
                <HotKeys keyMap={keyMap} handlers={handlers}>
                    { mainContent }
                </HotKeys>
            );
        } else {
            wrappedContent = mainContent;
        }
        // Add a list of action buttons if the cell is the active cell.
        let buttons = null;
        if ((isActiveCell) && (!showCommandsListing) && (!submitted)) {
            buttons = (
                <div className='module-form-buttons'>
                    { codeSnippetButton }
                    <span className='padding-lg'>
                        <Button
                            content='Change Command'
                            icon='wrench'
                            labelPosition='left'
                            onClick={this.handleShowCommandsListing}
                        />
                    </span>
                    <Button
                        content='Dismiss'
                        icon='close'
                        labelPosition='left'
                        negative
                        onClick={this.handleDismiss}
                    />
                    <Button
                        content='Submit'
                        disabled={onSubmit == null}
                        icon='paper plane outline'
                        labelPosition='left'
                        positive
                        onClick={this.handleSubmitForm}
                    />
                </div>
            );
        }
        return (
            <div className='cell-command-area'>
                { errorMessage }
                { wrappedContent }
                { buttons }
            </div>
        );
    }
}

// -----------------------------------------------------------------------------
// Helper Methods
// -----------------------------------------------------------------------------


export default CellCommandArea;
