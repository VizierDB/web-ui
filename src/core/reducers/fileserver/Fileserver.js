/**
 * Reducer for actions that retrieve and manipulate resources from the Vizier DB
 * Fileserver.
 */

import {
  REQUEST_FILES, RECEIVE_FILES, SET_FILE_DELETE_ERROR, SET_FILES_FETCH_ERROR,
  SET_FILE_UPDATE_ERROR, SET_FILE_UPLOAD_ERROR, START_UPLOAD
} from '../../actions/fileserver/Fileserver'
import { RECEIVE_SERVICE } from '../../actions/main/Service'
import { HATEOASReferences } from '../../util/Api'
import { UTC2LocalTime } from '../../util/Timestamp';


/**
 * STATE:
 *
 * deleteError: Error while deleting a file
 * fetchError: Error while fetching file listing
 * isFetchig: Flag indicating whether fetching is in progress
 * files: List of retrieved file handles
 * links: HATEOASReferences
 */

const INITIAL_STATE = {
    deleteError: null,
    fetchError: null,
    updateError: null,
    uploadError: null,
    isFetching: false,
    isUploading: false,
    files: [],
    links: null,
    serviceProperties: []
}

/**
 * Convert the list of files returned by the API into a list of objects that
 * contain id, name, createdAt, columns, rows, and a HATEOASReferences object.
 */
const listFiles = (files) => {
    let result = [];
    for (let i = 0; i < files.length; i++) {
        const fh = files[i]
        result.push({
            id: fh.id,
            name: fh.name,
            createdAt: UTC2LocalTime(fh.createdAt),
            lastModifiedAt: UTC2LocalTime(fh.lastModifiedAt),
            columns: fh.columns,
            rows: fh.rows,
            filesize: fh.filesize,
            links: new HATEOASReferences(fh.links)
        })
    }
    return result;
}

export const fileserver = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case REQUEST_FILES:
            return {
                ...state,
                isFetching: true
            }
        case RECEIVE_FILES:
            return {
                ...state,
                deleteError: null,
                fetchError: null,
                updateError: null,
                uploadError: null,
                isFetching: false,
                isUploading: false,
                files: listFiles(action.files),
                links: new HATEOASReferences(action.links)
            }
        case RECEIVE_SERVICE:
            return {
              ...state,
              serviceProperties: action.properties
            }
        case SET_FILE_DELETE_ERROR:
            return {
                ...state,
                isFetching: false,
                deleteError: action.error
            }
        case SET_FILES_FETCH_ERROR:
            return {
                ...state,
                isFetching: false,
                isUploading: false,
                fetchError: action.error
            }
        case SET_FILE_UPDATE_ERROR:
            return {
                ...state,
                isFetching: false,
                updateError: action.error
            }
        case SET_FILE_UPLOAD_ERROR:
            return {
                ...state,
                isUploading: false,
                uploadError: action.error
            }
        case START_UPLOAD:
            return {
                ...state,
                uploadError: null,
                isUploading: true
            }
    default:
      return state
  }
}
