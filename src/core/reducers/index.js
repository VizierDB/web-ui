import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import { app } from './main/App'
import { fileserver } from './fileserver/Fileserver'
import { mainPage } from './main/MainPage'
import { notebook } from './notebook/Notebook'
import { projectCreate } from './project/CreateProjectForm'
import { projectListing } from './project/ProjectListing'
import { projectPage} from './project/ProjectPage'
import { serviceApi } from './main/Service'
import { spreadsheet } from './spreadsheet/Spreadsheet'

const rootReducer = combineReducers({
    app,
    fileserver,
    mainPage,
    notebook,
    projectCreate,
    projectListing,
    projectPage,
    serviceApi,
    spreadsheet,
    router: routerReducer
})

export default rootReducer
