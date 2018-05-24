/**
 * Display a list of all workflow versions in a branch.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';
import { pageUrl } from '../../util/App'
import '../../../css/BranchHistory.css'


/**
 * Display a list of workflow descriptors (i.e., the history of a given project
 * branch). Each object in the workflows array is a WorkflowDescriptor object
 * that contains the workflow version, time of creation, and information about
 * the action that created the workflow version.
 */
class BranchHistory extends React.Component {
    static propTypes = {
        branch: PropTypes.object.isRequired,
        project: PropTypes.object.isRequired,
        workflows: PropTypes.array.isRequired
    }
    /**
     * The branch history is rendered as a table with three columns: (1) an
     * icon depicting the type of action that created the workflow version
     * (i.e., CREATE BRANCH, INSERT/APPEND MODULE, DELETE MODULE, or REPLACE
     * MODULE), (2) the short form of the command specification that was used
     * to define the module that was affected by the action, and (3) the time
     * of creation.
     */
    render() {
        const { project, branch, workflows } = this.props;
        const rows = [];
        for (let i = 0; i < workflows.length; i++) {
            const wf = workflows[i];
            const link = pageUrl(project.id, branch.id, wf.version);
            let icon = null;
            if (wf.actionIsCreate()) {
                icon = 'fork';
            } else if (wf.actionIsDelete()) {
                icon = 'trash';
            } else if (wf.actionIsInsert()) {
                icon = 'plus';
            } else if (wf.actionIsReplace()) {
                icon = 'pencil';
            } else {
                icon = 'question circle';
            }
            rows.push(
                <tr key={wf.version}>
                    <td><Icon name={icon} /></td>
                    <td className='version-statement'>
                        <a className={'version-link'} href={link}>
                            {wf.statement}
                        </a>
                    </td>
                    <td className='version-timestamp'>{wf.createdAt}</td>
                </tr>
            )
        }
        return (
            <div className='branch-history'>
                <h1 className='branch-history'>
                    {'History for branch '}
                    <span className='branch-highlight'>{branch.name}</span>
                </h1>
                <table><tbody>{rows}</tbody></table>
            </div>
        );
    }
}

export default BranchHistory;
