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
import { Dropdown } from 'semantic-ui-react';
import { DEFAULT_BRANCH } from '../../../resources/Branch'

/**
 * Branches Menu: Contains a list of project branches (to switch) and edit
 * options for the currently selected branch.
 */

class BranchMenuDropdown extends React.Component {
    static propTypes = {
        branches: PropTypes.array.isRequired,
        isLive: PropTypes.bool.isRequired,
        onDelete: PropTypes.func.isRequired,
        onEdit: PropTypes.func.isRequired,
        onGoLive: PropTypes.func.isRequired,
        onSelect: PropTypes.func.isRequired,
        onShowHistory: PropTypes.func.isRequired,
        selectedBranch: PropTypes.object.isRequired,
        onCreateBranch: PropTypes.func.isRequired
    }
    render() {
        const {
            branches, isLive, onDelete, onEdit, onGoLive, onSelect,
            onShowHistory, selectedBranch, onCreateBranch
        } = this.props;
        // List of items in the dropdown menu
        let branchItems = null;
        // List project branches (only if there is more than one branch)
        if (branches.length > 1) {
            branchItems = [
                <Dropdown.Divider key='divider'/>,
                <Dropdown.Header key='header' content='Switch Branch' />
            ]
            for (let i = 0; i < branches.length; i++) {
                const br = branches[i];
                let iconName;
                if (br.id === selectedBranch.id) {
                    iconName = 'checkmark box';
                } else {
                    iconName = 'square outline';
                }
                branchItems.push(
                    <Dropdown.Item
                        key={br.id}
                        icon={iconName}
                        active={br.id === selectedBranch.id}
                        text={br.name}
                        value={br.id}
                        onClick={() => (onSelect(br))}
                    />);
            }
        }
        return (
            <Dropdown item text='Branch'>
                <Dropdown.Menu>
                    <Dropdown.Item
                        key='edit'
                        icon='edit'
                        text='Rename'
                        onClick={onEdit}
                    />
                    <Dropdown.Item
                        key='delete'
                        icon='trash'
                        disabled={selectedBranch.id === DEFAULT_BRANCH}
                        text='Delete'
                        onClick={onDelete}
                    />
                    <Dropdown.Item
                        key='branch'
                        icon='fork'
                        disabled={false}
                        text='New'
                        onClick={onCreateBranch}
                    />
                    <Dropdown.Divider />
                    <Dropdown.Header content='Time Machine' />
                    <Dropdown.Item
                        key='history'
                        icon='history'
                        text='History'
                        onClick={onShowHistory}
                    />
                    <Dropdown.Item
                        key='live'
                        icon='play'
                        disabled={isLive}
                        text='Go Live!'
                        onClick={onGoLive}
                    />
                    { branchItems }
                </Dropdown.Menu>
            </Dropdown>
        );
    }
}

export default BranchMenuDropdown;
