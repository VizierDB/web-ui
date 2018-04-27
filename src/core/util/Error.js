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
