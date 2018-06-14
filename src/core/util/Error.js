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

/**
 * Objects for error messages that are generated during asynchronous processing.
 * Primarily used to group error messages and titles. We also distinguish
 * between error messages (return codes 400 or 500) and File Not Found errors
 * (return code 404).
 */

export class ErrorObject {
    constructor(title, message, status) {
        this.title = title;
        this.message = message;
        // Status is optional. If not given assume 400 or 500
        if (status != null) {
            this.status = status;
        } else {
            this.status = 400;
        }
    }
    /**
     * Distinguish between server errors and invalud requests or file not foound
     * errors.
     */
     is404() {
         return this.status === 404;
     }
}
