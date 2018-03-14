/**
 * Component that allows to select the current branch. In addition to switching
 * between branches the component allows to edit the branch name and to delete
 * selected branch.
 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Dropdown, Header, Icon, Input, Menu, Modal } from 'semantic-ui-react'
import { UpdateFormSpinner } from '../../components/util/Spinner';
import { ErrorMessage } from '../../components/util/Message';
import {
    clearMenuError, deleteBranch, setCurrentBranch, showChartView,
    showNotebookView, showSpreadsheetView, updateBranchName
} from '../../actions/project/ProjectMenu'
import { DEFAULT_BRANCH } from '../../util/Api'
import '../../../css/ResourceListing.css'
import '../../../css/ProjectPage.css'


class ProjectMenu extends React.Component {
    static propTypes = {
        branches: PropTypes.array.isRequired,
        datasets: PropTypes.array.isRequired,
        error: PropTypes.object,
        isBusy: PropTypes.bool.isRequired,
        selectedBranch: PropTypes.object,
        selectedChartView: PropTypes.object,
        selectedDataset: PropTypes.object,
        views: PropTypes.array.isRequired
    }
    constructor(props) {
        super(props);
        // The selector allows to edit the current branch or to delete it.
        // In both cases a respective modal is shown. At no point should both
        // modals be shown. If the branch name is edited the updated name is
        // kept in the local state variable branchName
        this.state = {
            showDeleteModal: false,
            showEditModal: false,
            branchName: null
        }
    }
    /**
     * Delete current branch after user conformation.
     */
    deleteCurrentBranch = () => {
        const { dispatch, selectedBranch } = this.props
        if (selectedBranch) {
            dispatch(
                deleteBranch(
                    selectedBranch.links.delete,
                    selectedBranch.links.project
                )
            )
        }
        this.hideModals()
    }
    /**
     * Clear error message generated while deleting a branch
     */
    clearError = () => {
        const { dispatch } = this.props
        dispatch(clearMenuError())
    }
    /**
     * Hide any modal that is being shown.
     */
    hideModals = () => {
        this.setState({
            showDeleteModal: false,
            showEditModal: false,
            branchName: null
        });
    }
    /**
     * Detect ESC key press to hide edit branch name modal or RETURN to
     * submit the form.
     */
    handleKeyDown = (event) => {
        if (event.keyCode === 27) {
            this.hideModals();
        } else if (event.keyCode === 13) {
            this.submitForm();
        }
    }
    /**
     * Handle changes in the edit branch name form input control element by
     * updating the internal state.
     */
    handleChange = (event) => {
        this.setState({branchName: event.target.value});
    }
    /**
     * Depending on the edit flag either show the name or the edit name form.
     */
    render() {
        const { error, isBusy, branches, datasets, selectedBranch, selectedChartView, selectedDataset, views } = this.props
        if (selectedBranch) {
            if (isBusy) {
                return (<UpdateFormSpinner />);
            } else {
                branches.sort(function(b1, b2) {return b1.name.localeCompare(b2.name)});
                // First component in the menu bar is a dropdown that (a) let's
                // user select the current branch, (b) edit the current branch
                // or (c) delete the current branch.
                let dropDownItems = [];
                for (let i = 0; i < branches.length; i++) {
                    const br = branches[i]
                    let iconName;
                    if (br.id === selectedBranch.id) {
                        iconName = 'checkmark box'
                    } else {
                        iconName = 'square outline'
                    }
                    dropDownItems.push(
                        <Dropdown.Item
                            key={br.id}
                            icon={iconName}
                            active={br.id === selectedBranch.id}
                            text={br.name}
                            value={br.id}
                            onClick={this.selectBranch}
                        />)
                }
                // The secons part of the menu bar is a list of items that allow
                // to switch between workflow notebook and spreadsheet view
                let workflowViews = [
                    <Menu.Item
                        key='notebook'
                        icon='file text outline'
                        name='notebook'
                        active={! selectedDataset}
                        onClick={this.showNotebook}
                    />
                ]
                // Add tabs for available datasets
                datasets.sort(function(d1, d2) {return d1.name.localeCompare(d2.name)});
                for (let i = 0; i < datasets.length; i++) {
                    const ds = datasets[i]
                    let isActive = false
                    if (selectedDataset) {
                        isActive = (selectedDataset.name === ds.name)
                    }
                    workflowViews.push(
                        <Menu.Item
                            key={'DS_' + ds.name}
                            icon='table'
                            name={ds.name}
                            value={ds.name}
                            active={isActive}
                            onClick={this.selectDataset}
                        />
                    )
                }
                // Add tabs for available dataset charts
                for (let i = 0; i < views.length; i++) {
                    const view = views[i]
                    let isActive = false
                    if (selectedChartView) {
                        isActive = (selectedChartView.name === view.name)
                    }
                    workflowViews.push(
                        <Menu.Item
                            key={'VW_' + view.name}
                            icon='bar chart'
                            name={view.name}
                            value={view.name}
                            active={isActive}
                            onClick={this.selectChartView}
                        />
                    )
                }
                let menuBar = (
                    <Menu pointing size='small'>
                        <Menu.Menu>
                            <Dropdown item icon='fork' text={selectedBranch.name}>
                                <Dropdown.Menu>
                                    <Dropdown.Header content='Select Branch' />
                                    { dropDownItems }
                                    <Dropdown.Divider />
                                    <Dropdown.Header content='Current Branch' />
                                    <Dropdown.Item
                                        key='edit'
                                        icon='edit'
                                        text='Edit'
                                        onClick={this.showEditModal}
                                    />
                                    <Dropdown.Item
                                        key='delete'
                                        icon='trash'
                                        disabled={selectedBranch.id === DEFAULT_BRANCH}
                                        text='Delete'
                                        onClick={this.showDeleteModal}
                                    />
                                </Dropdown.Menu>
                            </Dropdown>
                        </Menu.Menu>
                        { workflowViews }
                    </Menu>
                )
                // Show a modal if the user has selected to either edit the
                // branch name or to delete the selected branch. It is expected
                // that at most one of the two show modal flags is true.
                let modal = null
                const { showDeleteModal, showEditModal } = this.state
                if (showDeleteModal) {
                    modal = (
                        <Modal open={true} basic size='small'>
                            <Header icon='trash' content='Delete Branch' />
                            <Modal.Content>
                                <p>Do you really want to delete the branch '{selectedBranch.name}'?</p>
                            </Modal.Content>
                            <Modal.Actions>
                                <Button basic color='red' inverted onClick={this.hideModals}>
                                    <Icon name='remove' /> No
                                </Button>
                                <Button
                                    color='green'
                                    inverted
                                    onClick={this.deleteCurrentBranch}
                                >
                                    <Icon name='checkmark' /> Yes
                                </Button>
                            </Modal.Actions>
                        </Modal>
                    );
                } else if (showEditModal) {
                    modal = (
                            <Modal open={true} size={'small'}>
                                <Modal.Header>{'Enter a new branch name ...'}</Modal.Header>
                                <Modal.Content>
                                    <div className="resource-name">
                                        <Input
                                            autoFocus
                                            className="resource-name-input"
                                            value={this.state.branchName}
                                            onChange={this.handleChange}
                                            onKeyDown={this.handleKeyDown}
                                        />
                                    </div>
                                </Modal.Content>
                                <Modal.Actions>
                                    <Button  negative onClick={this.hideModals}>
                                        Cancel
                                    </Button>
                                    <Button
                                        positive
                                        icon='checkmark'
                                        labelPosition='right'
                                        content="Rename"
                                        onClick={this.submitForm}
                                    />
                                </Modal.Actions>
                            </Modal>
                        );
                }
                // Show an error message if the last user action returned an
                //
                let errorMessage = null
                if (error) {
                    errorMessage = (<ErrorMessage
                        title={error.title}
                        message={error.message}
                        handleDismiss={this.clearError}
                    />)
                }
                return (
                    <div className='project-menu-bar'>
                        { menuBar }
                        { modal }
                        { errorMessage }
                    </div>
                );
            }
        } else {
            return null;
        }
    }
    /**
     * Set the current branch.
     */
    selectBranch = (e, { value }) => {
        const { dispatch, branches } = this.props
        for (let i = 0; i < branches.length; i++) {
            const br = branches[i]
            if (br.id === value) {
                dispatch(setCurrentBranch(br))
                break
            }
        }
    }
    /**
     * Set the dataset that is shown in the spreadsheet view.
     */
    selectChartView = (e, { value }) => {
        const { dispatch, views } = this.props
        for (let i = 0; i < views.length; i++) {
            const view = views[i]
            if (view.name === value) {
                dispatch(showChartView(view))
                break
            }
        }
    }
    /**
     * Set the dataset that is shown in the spreadsheet view.
     */
    selectDataset = (e, { value }) => {
        const { dispatch, datasets } = this.props
        for (let i = 0; i < datasets.length; i++) {
            const ds = datasets[i]
            if (ds.name === value) {
                dispatch(showSpreadsheetView(ds))
                break
            }
        }
    }
    /**
     * Show the delete branch confirm dialog.
     */
    showDeleteModal = () => {
        const { selectedBranch } = this.props
        if (selectedBranch) {
            this.setState({showDeleteModal: true, showEditModal: true});
        }
    }
    /**
     * Show the branch name edit form.
     */
    showEditModal = () => {
        const { selectedBranch } = this.props
        if (selectedBranch) {
            this.setState({
                showDeleteModal: false,
                showEditModal: true,
                branchName: selectedBranch.name
            });
        }
    }
    showNotebook = () => {
        const { dispatch } = this.props
        dispatch(showNotebookView())
    }
    /**
     * Submit the edit name form (automatically when user presses <RETURN>)
     */
    submitForm = () => {
        const { dispatch, selectedBranch } = this.props
        if (selectedBranch) {
            dispatch(updateBranchName(
                selectedBranch,
                this.state.branchName,
                selectedBranch.links.project
            ))
        }
        this.hideModals()
    }
}


const mapStateToProps = state => {

    return {
        branches: state.projectMenu.branches,
        datasets: state.projectMenu.datasets,
        error: state.projectMenu.error,
        isBusy: state.projectMenu.isBusy,
        selectedBranch: state.projectMenu.selectedBranch,
        selectedChartView: state.projectMenu.selectedChartView,
        selectedDataset: state.projectMenu.selectedDataset,
        views: state.projectMenu.views
    }
}

export default connect(mapStateToProps)(ProjectMenu)
