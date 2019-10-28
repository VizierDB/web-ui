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

import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { app } from './main/App';
import { mainPage } from './main/MainPage';
import { branchPage } from './project/BranchPage';
import { spreadsheetPage } from './project/SpreadsheetPage';
import { datasetErrorsPage } from './project/DatasetCaveatsPage';
import { notebookPage } from './project/NotebookPage';
import { projectListing } from './project/ProjectListing';
import { projectPage} from './project/ProjectPage';
import { serviceApi } from './main/Service';
import { spreadsheet } from './spreadsheet/Spreadsheet';

const rootReducer = combineReducers({
    app,
    branchPage,
    mainPage,
    notebookPage,
    spreadsheetPage,
    datasetErrorsPage,
    projectListing,
    projectPage,
    serviceApi,
    spreadsheet,
    router: routerReducer
})

export default rootReducer
