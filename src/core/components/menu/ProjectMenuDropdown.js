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
        onCreate: PropTypes.func.isRequired,
        onImport: PropTypes.func.isRequired,
        onDelete: PropTypes.func,
        onEdit: PropTypes.func.isRequired,
        onSelect: PropTypes.func.isRequired,
        project: PropTypes.object,
        projectList: PropTypes.array,
    }
    /**
     * handle project export
     */
    handleExportProject = (project) => () => {
    	window.open(project.links.getSelf() + "/export")
    }
    render() {
        const {
            onCreate,
            onImport,
            onDelete,
            onEdit,
            //onSelect,
            project,
            //projectList
        } = this.props;
        const menuItems = [];
        // Show the current project name, the rename option and the delete
        // option if there is a current project
        if (project != null) {
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
            menuItems.push(<Dropdown.Item
                key='delete'
                icon='trash'
                text='Delete'
                title='Delete the current project'
                onClick={onDelete}
            />);
        }
        // todo: add funcationality to display the latest 5 projects (issue 169)
        // Show project listing only if the variable is set and contains more
        // than one project
        // if ((projectList != null) && (projectList.length > 1)) {
        //     if (menuItems.length > 0) {
        //         menuItems.push(<Dropdown.Divider key='div1'/>);
        //         menuItems.push(<Dropdown.Header
        //             key='header2'
        //             content='Projects'
        //         />);
        //     }
        //     for (let i = 0; i < projectList.length; i++) {
        //         let pj = projectList[i];
        //         menuItems.push(<Dropdown.Item
        //             key={pj.id}
        //             disabled={(project != null) && (pj.id === project.id)}
        //             icon='database'
        //             text={pj.name}
        //             title={'Switch to project ' + pj.name}
        //             onClick={() => (onSelect(pj))}
        //         />);
        //     }
        // }
        // Show the add project option at the bottom of the menu
        if (menuItems.length > 0) {
            menuItems.push(<Dropdown.Divider key='div2'/>);
        }
        menuItems.push(<Dropdown.Item
            key='create'
            icon='plus'
            text='New Project ...'
            title='Create a new project'
            onClick={onCreate}
        />);
        menuItems.push(<Dropdown.Item
            key='import'
            icon='plus'
            text='Import Project ...'
            title='Import a project from a export file'
            onClick={onImport}
        />);
        if ( project != null ){
        	menuItems.push(<Dropdown.Item
                    key='export'
                    disabled={(project == null)}
                    icon='database'
                    text={'Export Project'}
                    title={'Export current project'}
                    onClick={this.handleExportProject(project)}
                />);
        }
        return (
            <Dropdown item text='Projects'>
                <Dropdown.Menu>
                    { menuItems }
                </Dropdown.Menu>
            </Dropdown>
        );
    }
}

export default ProjectMenuDropdown;
