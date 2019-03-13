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


// Default number of rows that are fetched when displaying a dataset in the
// notebook cell output area.
const DEFAULT_CELL_DATASET_ROW_LIMIT = 10;
// By now the commands that are filtered by default are hard-coded.
export const DEFAULT_FILTERED_COMMANDS = {
    vizual: [
        'deleteColumn',
        'deleteRow',
        'insertColumn',
        'insertRow',
        'moveColumn',
        'moveRow',
        'renameColumn',
        'updateCell'
    ]
}
// By default filtered commands are collapsed and not hidden
const DEFAULT_HIDE_FILTERED_COMMANDS = false;
// Default order of cells in a notebook
const DEFAULT_SHOW_NOTEBOOK_REVERESED = false;


/**
 * Object to capture all user preferences and their default values.
 */
export class UserSettings {
    constructor(filteredCommands, cellRowLimit, reversedOrder, hideCommands, clipboard) {
        this.filteredCommands = (filteredCommands != null) ? filteredCommands : DEFAULT_FILTERED_COMMANDS;
        this.cellDatasetRowLimit = (cellRowLimit != null) ? cellRowLimit : DEFAULT_CELL_DATASET_ROW_LIMIT;
        this.reversedOrder = (reversedOrder != null) ? reversedOrder : DEFAULT_SHOW_NOTEBOOK_REVERESED;
        this.hideCommands = (hideCommands != null) ? hideCommands : DEFAULT_HIDE_FILTERED_COMMANDS;
        this.clipboard = clipboard;
    }
    /**
     * Add the given command to the list of commands that are selected to
     * be hidden by the user. Returns a new user settinsg object.
     */
    addCommandToHiddenList(command) {
        const commandList = {};
        const pckg = this.filteredCommands[command.packageId];
        if (pckg != null) {
            const modifiedList = [];
            let found = false;
            for (let i = 0; i < pckg.length; i++) {
                if (pckg[i] !== command.id) {
                    modifiedList.push(pckg[i]);
                } else {
                    found = true;
                }
            }
            if (!found) {
                modifiedList.push(command.id);
            }
            commandList[command.packageId] = modifiedList;
        } else {
            commandList[command.packageId] = [command.id];
        }
        for (let prop in this.filteredCommands) {
            if (prop !== command.packageId) {
                commandList[prop] = this.filteredCommands[prop];
            }
        }
        return new UserSettings(
            commandList,
            this.cellRowLimitValue,
            this.reversedOrder,
            this.hideCommands
        );
    }
    /**
     * Number of rows that are fetched when a dataset is displayed in the output
     * area of a notebook cell.
     */
    cellRowLimit() {
        return this.cellDatasetRowLimit;
    }
    /**
     * Copy the module specification and command arguments of the given cell to
     * the clipboard. Returns a modified object.
     */
    copyCell(cell) {
        let content = null;
        if (!cell.isNewCell()) {
            content = {
                commandSpec: cell.commandSpec,
                arguments: cell.module.command.arguments
            };
        }
        return new UserSettings(
            this.filteredCommands,
            this.cellRowLimitValue,
            this.reversedOrder,
            this.hideCommands,
            content
        );
    }
    /**
     * Test if a given command is included in the list of filtered commands.
     */
    isFiltered(command) {
        const pckg = this.filteredCommands[command.packageId];
        if (pckg != null) {
            if (pckg.find((c) => (c === command.id))) {
                return true;
            }
        }
        return false;
    }
    /**
     * Flag indicating if notebook cells that have filtered commands are hidden
     * or just collapsed.
     */
    hideFilteredCommands() {
        return this.hideCommands;
    }
    /**
     * Toggle the reverse notebook cell order. Returns a modified user settings
     * object.
     */
    reverseOrder() {
        return new UserSettings(
            this.filteredCommands,
            this.cellRowLimitValue,
            !this.reversedOrder,
            this.hideCommands
        );
    }
    /**
     * Remove the given command from the list of commands that are selected to
     * be hidden by the user. Returns a new user settinsg object.
     */
    removeCommandFromHiddenList(command) {
        const commandList = {};
        for (let prop in this.filteredCommands) {
            if (prop === command.packageId) {
                const commands = this.filteredCommands[prop];
                const modifiedList = [];
                for (let i = 0; i < commands.length; i++) {
                    if (commands[i] !== command.id) {
                        modifiedList.push(commands[i]);
                    }
                }
                if (modifiedList.length > 0) {
                    commandList[prop] = modifiedList;
                }
            } else {
                commandList[prop] = this.filteredCommands[prop];
            }
        }
        return new UserSettings(
            commandList,
            this.cellRowLimitValue,
            this.reversedOrder,
            this.hideCommands
        );
    }
    /**
     * Set the object that contains the filtered module identifier. Expects an
     * object where the properties are package identifier and the values are
     * lists of command identifier. Returns a modified user settings object.
     */
    setFilter(filter) {
        // Eesure that the filter is not null
        const filteredCommands = (filter != null) ? filter : {};
        return new UserSettings(
            filteredCommands,
            this.cellRowLimitValue,
            this.reversedOrder,
            this.hideCommands
        );
    }
    /**
     * Flag indicating whether the cells in a notebook should be shown in
     * reverse order or not.
     */
    showNotebookReversed() {
        return this.reversedOrder;
    }
    /**
     * Toggle the hide filtered commands value. Returns a modified user settings
     * object.
     */
    toggleHideCells() {
        return new UserSettings(
            this.filteredCommands,
            this.cellRowLimitValue,
            this.reversedOrder,
            !this.hideCommands
        );
    }
}
