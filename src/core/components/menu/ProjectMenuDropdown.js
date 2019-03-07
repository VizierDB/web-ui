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

/**
 * Project Menu: The only menu item is for renaming the project.
 */

class ProjectMenuDropdown extends React.Component {
    static propTypes = {
        onEdit: PropTypes.func.isRequired,
        onSelect: PropTypes.func.isRequired,
        project: PropTypes.object.isRequired,
        projectList: PropTypes.array,
    }
    render() {
        const { onEdit, onSelect, project, projectList } = this.props;
        const menuItems = [];
        // Show the current project name and the rename option at all times
        menuItems.push(<Dropdown.Header
            key='header1'
            icon='database'
            content={project.name} />
        );
        menuItems.push(<Dropdown.Item
            key='edit'
            icon='edit'
            text='Rename'
            title='Edit project name'
            onClick={onEdit}
        />);
        // Show project listing only if the variable is set and contains more
        // than one project
        if ((projectList != null) && (projectList.length > 1)) {
            menuItems.push(<Dropdown.Divider key='div1'/>);
            menuItems.push(<Dropdown.Header
                key='header2'
                content='Other Projects'
            />);
            for (let i = 0; i < projectList.length; i++) {
                let pj = projectList[i];
                if (pj.id !== project.id) {
                    menuItems.push(<Dropdown.Item
                        key={pj.id}
                        icon='database'
                        text={pj.name}
                        title={'Switch to project ' + pj.name}
                        onClick={() => (onSelect(pj))}
                    />);
                }
            }
        }
        return (
            <Dropdown item text='Project'>
                <Dropdown.Menu>
                    { menuItems }
                </Dropdown.Menu>
            </Dropdown>
        );
    }
}

export default ProjectMenuDropdown;
