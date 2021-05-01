/**
 * Copyright (C) 2018-2019 New York University
 *                         University at Buffalo,
 *                         Illinois Institute of Technology.
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

import {groupBy} from "lodash";
import {DatasetHandle} from "./Dataset";
/**
 * Defintion of objects that represent the different types of output that
 * are associated with a notebook cell.
 */


// Output cell resource type identifier
export const CONTENT_CHART = 'CONTENT_CHART';
export const CONTENT_DATASET = 'CONTENT_DATASET';
export const CONTENT_ERROR = 'CONTENT_ERROR';
export const CONTENT_HTML = 'CONTENT_HTML';
export const CONTENT_MARKDOWN = 'CONTENT_MARKDOWN';
export const CONTENT_HIDE = 'CONTENT_HIDE';
export const CONTENT_TEXT = 'CONTENT_TEXT';
export const CONTENT_JAVASCRIPT = 'CONTENT_JAVASCRIPT';
export const CONTENT_TIMESTAMPS = 'CONTENT_TIMESTAMPS';
export const CONTENT_MULTIPLE = 'CONTENT_MULTIPLE';

/**
 * Output resource content. Contains functionality to determine content type
 * and whether the content is currently being fetched from the server.
 */
class OutputResource {
    constructor(type, isFetching) {
        this.type = type;
        this.isFetching = (isFetching != null) ? isFetching : false;
    }
    isChart = () => (this.type === CONTENT_CHART);
    isDataset = () => (this.type === CONTENT_DATASET);
    isError = () => (this.type === CONTENT_ERROR);
    isHidden = () => (this.type === CONTENT_HIDE);
    isHtml = () => (this.type === CONTENT_HTML);
    isMarkdown = () => (this.type === CONTENT_MARKDOWN);
    isText = () => (this.type === CONTENT_TEXT);
    isTimestamps = () => (this.type === CONTENT_TIMESTAMPS);
    isJavascript = () => (this.type === CONTENT_JAVASCRIPT);
    isMultiple = () => (this.type === CONTENT_MULTIPLE);
}

// Extended output resources for the different types of output.


/**
 * Output resource for showing a chart plotted for a given dataset in a
 * notebook cell.
 */
export class OutputChart extends OutputResource {
    constructor(name, dataset, isFetching) {
        super(CONTENT_CHART, isFetching);
        this.name = name;
        this.dataset = dataset;
    }
    /**
     * Return a copy of the resource where the isFetching flag is true.
     */
    setFetching() {
        return new OutputChart(this.name, this.dataset, true);
    }
}


/**
 * Output resource for showing dataset rows in a notebook cell
 */
export class OutputDataset extends OutputResource {
    constructor(dataset, isFetching) {
        super(CONTENT_DATASET, isFetching);
        this.dataset = dataset;
    }
    /**
     * Return a copy of the resource where the isFetching flag is true.
     */
    setFetching() {
        return new OutputDataset(this.dataset, true);
    }
}


/**
 * Output resource for showing an error message resulting from a content
 * fetch error.
 */
export class OutputError extends OutputResource {
    constructor(error, isFetching) {
        super(CONTENT_ERROR, isFetching);
        this.error = error;
    }
    /**
     * Return a copy of the resource where the isFetching flag is true.
     */
    setFetching() {
        return new OutputError(this.error, true);
    }
}


/**
 * Output resource when hiding output for a notebook cell.
 */
export class OutputHidden extends OutputResource {
    constructor(isFetching) {
        super(CONTENT_HIDE, isFetching);
    }
    /**
     * Return a copy of the resource where the isFetching flag is true.
     */
    setFetching() {
        return new OutputHidden(true);
    }
}


/**
 * Output resource for showing content of the module standard output as HTML
 * in the output area of a notebook cell.
 */
export class OutputHtml extends OutputResource {
    constructor(outputObjects, isFetching) {
        super(CONTENT_HTML, isFetching);
        this.lines  = [];
        for (let j = 0; j < outputObjects.length; j++) {
            const out = outputObjects[j];
            if (out.type != null) {
                if (out.type === 'text/html') {
                    this.lines.push(out.value);
                }
            } else {
                this.lines.push(out);
            }
        }
    }
    /**
     * Return a copy of the resource where the isFetching flag is true.
     */
    setFetching() {
        return new OutputHtml(this.lines, true);
    }
}
/**
 * Output resource for showing content of the module standard output as HTML
 * in the output area of a notebook cell, enhanced with Javascript
 */
export class OutputJavascript extends OutputResource {
    constructor(outputObjects, isFetching) {
        super(CONTENT_JAVASCRIPT, isFetching);
        this.lines  = [];
        for (let j = 0; j < outputObjects.length; j++) {
            const out = outputObjects[j];
            if (out.type != null) {
                if (out.type === 'text/javascript') {
                    this.lines.push(out);
                }
            } else {
                this.lines.push(out);
            }
        }
    }
    /**
     * Return a copy of the resource where the isFetching flag is true.
     */
    setFetching() {
        return new OutputHtml(this.lines, true);
    }
}


/**
 * Output resource for showing content of the module standard output as Markdown
 * in the output area of a notebook cell.
 */
export class OutputMarkdown extends OutputResource {
    constructor(outputObjects, isFetching) {
        super(CONTENT_MARKDOWN, isFetching);
        this.lines  = [];
        for (let j = 0; j < outputObjects.length; j++) {
            const out = outputObjects[j];
            if (out.type != null) {
                if (out.type === 'text/markdown') {
                    this.lines.push(out.value);
                }
            } else {
                this.lines.push(out);
            }
        }
    }
    /**
     * Return a copy of the resource where the isFetching flag is true.
     */
    setFetching() {
        return new OutputMarkdown(this.lines, true);
    }
}

/**
 * Output resource for showing content of the module standard output as plain
 * text in the output area of a notebook cell.
 */
export class OutputText extends OutputResource {
    constructor(outputObjects, isFetching) {
        super(CONTENT_TEXT, isFetching);
        this.lines  = [];
        for (let j = 0; j < outputObjects.length; j++) {
            const out = outputObjects[j];
            if (out.type != null) {
                if (out.type === 'text/plain') {
                    this.lines.push(out.value);
                }
            } else {
                this.lines.push(out);
            }
        }
    }
    /**
     * Return a copy of the resource where the isFetching flag is true.
     */
    setFetching() {
        return new OutputText(this.lines, true);
    }
}

/**
 * Output resource for showing content of the module standard output as an array of multiple resources
 * in the output area of a notebook cell.
 */
export class OutputMultiple extends OutputResource {
    constructor(outputObjects, isFetching) {
        super(CONTENT_MULTIPLE, isFetching);
        this.outputs = {};
        let stdoutGrouped = groupBy(outputObjects, 'type');
        for (let out in stdoutGrouped) {
            // assuming only one dataset or chart object can exist per output
            switch (out) {
                case 'text/plain': this.outputs[out] = stdoutGrouped[out].map(x => x.value).join("\n"); break;
                case 'text/markdown' : this.outputs[out] = stdoutGrouped[out].map(x => x.value).join("\n"); break;
                case 'text/html': this.outputs[out] = stdoutGrouped[out].map(x => x.value).join("\n"); break;
                case 'dataset/view': this.outputs[out] = new DatasetHandle().fromJson(stdoutGrouped[out][0].value); break;
                case 'chart/view': this.outputs[out] = stdoutGrouped[out][0].value; break;
                default: this.outputs[out] = stdoutGrouped[out][0]; break;
            }
        }
    }
    /**
     * Return a copy of the resource where the isFetching flag is true.
     */
    setFetching() {
        return new OutputMultiple(this.outputs, true);
    }
}

/**
 * Output resource for showing the timestamps for different stages of module
 * execution in the output area of a notebook cell.
 */
export class OutputTimestamps extends OutputResource {
    constructor(createdAt, startedAt, finishedAt) {
        super(CONTENT_TIMESTAMPS);
        this.createdAt = createdAt;
        this.startedAt = startedAt;
        this.finishedAt = finishedAt;
    }
    /**
     * Return a copy of the resource where the isFetching flag is true.
     */
    setFetching() {
        return new OutputTimestamps(
            this.createdAt,
            this.startedAt,
            this.finishedAt,
            true
        );
    }
}

// Shortcut to show text output for all lines in standard output. Depending on
// whether the output is plain/text of html a different output resource is
// returned.
export const StandardOutput = (module) => {
    const stdout = module.outputs.stdout;
    let outputResource = null;
    if (stdout.length === 1) {
        const out = stdout[0];
        if (out.type === 'text/html') {
            outputResource = new OutputHtml(stdout);
        } else if (out.type === 'text/markdown') {
            outputResource = new OutputMarkdown(stdout);
        } else if (out.type === 'text/javascript') {
            outputResource = new OutputJavascript(stdout);
        } else if (out.type === 'chart/view') {
            outputResource = new OutputChart(out.value.data.name, out.value.result);
        } else if (out.type === 'dataset/view') {
            outputResource = new OutputDataset(new DatasetHandle(out.value.id, out.value.name).fromJson(out.value), false);
        } else {
            outputResource = new OutputText(stdout);
        }
    } else if (stdout.length > 1) {
        outputResource = new OutputMultiple(stdout);
    }
    // Make sure that there is some output
    if (outputResource === null) {
        outputResource = new OutputText([]);
    }
    return outputResource;
}
