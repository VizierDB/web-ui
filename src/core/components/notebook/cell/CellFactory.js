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
import EditableNotebookCell from './EditableNotebookCell';
import EmptyNotebookCell from './EmptyNotebookCell';
import NotebookCellGroup from './NotebookCellGroup';
import ReadOnlyNotebookCell from './ReadOnlyNotebookCell';

/**
 * Helper methods to create various types of cells.
 */

/**
 * Generate unique key for notebook cell from notebook identifier and cell index
 * position.
 */
 const cellKey = (notebook, cellType, cellIndex) => (notebook.id + cellType + cellIndex)


 /**
  * Get an empty notebook cell.
  */
 export const EmptyCell = (props, datasets, index) => {
     const {
         notebook,
         project,
         onInsertModule,
     } = props;
     // Get the next module in the notebook (if not at end of notebook).
     let nextModule = null;
     if (index < notebook.cells.length - 1) {
         nextModule = notebook.cells[index + 1].module;
     }
     // Return an empty cell.
     return (
         <EmptyNotebookCell
             key={cellKey(notebook, 'EMP', index)}
             datasets={datasets}
             env={project.environment}
             nextModule={nextModule}
             notebook={notebook}
             onSubmit={onInsertModule}
         />
     );
 }


 /**
  * Get a grouped cell for the given list of modules.
  */
 export const GroupCell = (props, cells, errorState, index) => {
     const {
         groupMode,
         notebook,
         reversed,
         onChangeGrouping,
     } = props;
     if (reversed) {
         cells.reverse();
     }
     return (
         <NotebookCellGroup
             key={cellKey(notebook, 'GRP', index)}
             cells={cells}
             startIndex={(index - cells.length) + 1}
             endIndex={index}
             errorState={errorState}
             groupMode={groupMode}
             onChangeGrouping={onChangeGrouping}
         />
     );
 }


 /**
  * Get an editable notebook cell for a given workflow module.
  */
 export const ModuleCell = (props, cell, datasets, index) => {
     const {
         notebook,
         project,
         onCreateBranch,
         onDeleteModule,
         onNavigateDataset,
         onOutputSelect,
         onReplaceModule,
         onShowAnnotations
     } = props;
     return (
         <EditableNotebookCell
             key={cellKey(notebook, 'MOD', index)}
             datasets={datasets}
             env={project.environment}
             cell={cell}
             sequenceIndex={index + 1}
             onCreateBranch={onCreateBranch}
             onDeleteModule={onDeleteModule}
             onNavigateDataset={onNavigateDataset}
             onOutputSelect={onOutputSelect}
             onShowAnnotations={onShowAnnotations}
             onSubmit={onReplaceModule}
         />
     );
 }


/**
 * Get a read-only cell for a module in a workflow.
 */
 export const ReadOnlyCell = (props, cell, errorState, index) => {
     const {
         notebook,
         onNavigateDataset,
         onOutputSelect,
         onShowAnnotations
     } = props;
     return (
         <ReadOnlyNotebookCell
             key={cellKey(notebook, 'ERR', index)}
             cell={cell}
             errorState={errorState}
             sequenceIndex={index + 1}
             onNavigateDataset={onNavigateDataset}
             onOutputSelect={onOutputSelect}
             onShowAnnotations={onShowAnnotations}
         />
     );
 }
