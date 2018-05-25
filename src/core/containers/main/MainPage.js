import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Icon, Menu } from 'semantic-ui-react'
import { setActiveItem } from '../../actions/main/MainPage'
import { ConnectionInfo } from '../../components/Api'
import { WarningMessage } from '../../components/Message';
import Fileserver from '../fileserver/Fileserver'
import HomePageContent from '../../components/main/HomePageContent'
import ProjectListing from '../project/ProjectListing'
import '../../../css/App.css'


/**
 * Unique identifier for menu items.
 */
export const MENU_ITEM_FILES = 'files'
export const MENU_ITEM_HOME = 'home'
export const MENU_ITEM_PROJECTS = 'projects'


class MainPage extends Component {
    static propTypes = {
        activeItem: PropTypes.string.isRequired,
        homePageContent: PropTypes.string,
        serviceApi: PropTypes.object
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
        const { activeItem, homePageContent, serviceApi } = this.props
        let content = null;
        if (activeItem === MENU_ITEM_HOME) {
            content = <HomePageContent content={homePageContent}/>
        } else if (activeItem === MENU_ITEM_PROJECTS) {
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
                <div className='main-menu'>
                    <Menu secondary>
                        <Menu.Item header>
                            {window.env.APP_TITLE}
                        </Menu.Item>
                        <Menu.Item
                            name={MENU_ITEM_HOME}
                            active={activeItem === MENU_ITEM_HOME}
                            onClick={this.handleItemClick.bind(this)}
                        >
                            <Icon name='home' />
                            Home
                        </Menu.Item>
                        <Menu.Item
                            name={MENU_ITEM_PROJECTS}
                            active={activeItem === MENU_ITEM_PROJECTS}
                            onClick={this.handleItemClick.bind(this)}
                        >
                            <Icon name='database' />
                            Projects
                        </Menu.Item>
                        <Menu.Item
                            name={MENU_ITEM_FILES}
                            active={activeItem === MENU_ITEM_FILES}
                            onClick={this.handleItemClick.bind(this)}
                        >
                            <Icon name='file outline' />
                            Files
                        </Menu.Item>
                    </Menu>
                </div>
                <div className='page-content wide'>
                    { content }
                    <ConnectionInfo api={serviceApi}/>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {

    return {
        activeItem: state.mainPage.activeItem,
        homePageContent: state.mainPage.homePageContent,
        serviceApi: state.serviceApi,
    }
}

export default connect(mapStateToProps)(MainPage)
