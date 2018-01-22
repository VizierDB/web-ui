import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Menu } from 'semantic-ui-react'
import { setActiveItem } from '../../actions/main/MainPage'
import { WarningMessage } from '../../components/util/Message';
import Fileserver from '../fileserver/Fileserver'
import ProjectListing from '../project/ProjectListing'


/**
 * Unique identifier for menu items.
 */
export const MENU_ITEM_FILES = 'files'
export const MENU_ITEM_PROJECTS = 'projects'


class MainPage extends Component {
    static propTypes = {
        activeItem: PropTypes.string.isRequired
    }
    /**
     * Change active item in main content menu
     */
    handleItemClick(e, {name}) {
        const { dispatch } = this.props
        dispatch(setActiveItem(name))
    }
    /**
     */
    render() {
        const { activeItem } = this.props
        let content = null;
        if (activeItem === MENU_ITEM_PROJECTS) {
            content = <ProjectListing />
        } else if (activeItem === MENU_ITEM_FILES) {
            content = <Fileserver />
        } else {
            content = (<WarningMessage
                title="Invalid State"
                message="Unknown content selector"
            />);
        }
        return (
            <div className='main-page'>
                <h1>{window.env.APP_TITLE}</h1>
                <Menu pointing secondary>
                  <Menu.Item
                      name={MENU_ITEM_PROJECTS}
                      active={activeItem === MENU_ITEM_PROJECTS}
                      onClick={this.handleItemClick.bind(this)}
                  >Curation Projects</Menu.Item>
                  <Menu.Item
                      name={MENU_ITEM_FILES}
                      active={activeItem === MENU_ITEM_FILES}
                      onClick={this.handleItemClick.bind(this)}
                  >Uploaded Files</Menu.Item>
                </Menu>
                { content }
            </div>
        );
    }
}

const mapStateToProps = state => {

    return {
        activeItem: state.mainPage.activeItem
    }
}

export default connect(mapStateToProps)(MainPage)
