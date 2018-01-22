import { combineReducers } from 'redux'
import { fileserver } from './fileserver/Fileserver'
import { mainPage } from './main/MainPage'
import { notebook } from './notebook/Notebook'
import { projectCreate } from './project/CreateProjectForm'
import { projectListing } from './project/ProjectListing'
import { projectMenu } from './project/ProjectMenu'
import { projectName } from './project/ProjectNameForm'
import { projectPage} from './project/ProjectPage'
import { spreadsheet } from './spreadsheet/Spreadsheet'
import { workflow } from './project/Workflow'
import { serviceApi } from './main/Service'

const rootReducer = combineReducers({
    fileserver,
    projectCreate,
    projectListing,
    projectMenu,
    projectName,
    projectPage,
    mainPage,
    notebook,
    serviceApi,
    spreadsheet,
    workflow
})

export default rootReducer
