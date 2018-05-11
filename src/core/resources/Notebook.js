import { NoAnnotation } from './Annotation';
import { ChartDescriptor } from './Chart';
import { DatasetDescriptor } from './Dataset';
import { HATEOASReferences } from '../util/HATEOAS';
import { sortByName } from '../util/Sort';



// -----------------------------------------------------------------------------
// Cell Output
// -----------------------------------------------------------------------------

// Output cell resource type identifier
export const CONTENT_CHART = 'CONTENT_CHART'
export const CONTENT_DATASET = 'CONTENT_DATASET'
export const CONTENT_ERROR = 'CONTENT_ERROR'
export const CONTENT_TEXT = 'CONTENT_TEXT'


/**
 * Output resource content. Contains functionality to determine content type.
 */
class OutputResource {
    constructor(type, content, isFetching) {
        this.type = type;
        this.content = content;
        this.isFetching = isFetching;
    }
    isChart = () => (this.type === CONTENT_CHART);
    isDataset = () => (this.type === CONTENT_DATASET);
    isError = () => (this.type === CONTENT_ERROR);
    isText = () => (this.type === CONTENT_TEXT);
}

export const OutputChart = (name, dataset) => (new OutputResource(CONTENT_CHART, {name, dataset}, false));
export const OutputDataset = (name, dataset) => (new OutputResource(CONTENT_DATASET, {name, dataset}, false));
export const OutputError = (error) => (new OutputResource(CONTENT_ERROR, error, false));
export const OutputFetching = (output) => (new OutputResource(output.type, output.content, true));
export const OutputText = (outputObjects) => {
    const lines  = [];
    for (let j = 0; j < outputObjects.length; j++) {
        const out = outputObjects[j];
        if (out.type === 'text/plain') {
            lines.push(out.data);
        }
    }
    return new OutputResource(CONTENT_TEXT, {lines}, false);
};


// -----------------------------------------------------------------------------
// Notebook
// -----------------------------------------------------------------------------

/**
 * A notebook resource is a list of cells. Each cell corresponds to a module
 * in an underlying workflow. In addition to the workflow module each cell in
 * the notebook has an output resource. This resource is shown in the output
 * area when the notebook cell is rendered.
 */
export class Notebook {
    constructor(cells) {
        this.cells = cells;
    }
    /**
     * Initialize the notebook from a Json object returned by the API. Expects
     * the object to contain the workflow modules (.modules) and dataset
     * descriptors (.dataset).
     */
    fromJson(json) {
        // Index of all datasets in the workflow modules. Datasets are indexed
        // by their id.
        const datasets = []
        for (let i = 0; i < json.datasets.length; i++) {
            const ds = json.datasets[i]
            datasets[ds.id] = ds;
        }
        // Create notebook cells from list of of workflow modules returned by
        // the API
        this.cells = [];
        for (let i = 0; i < json.modules.length; i++) {
            const module = json.modules[i];
            // Transform arguments from an array of (name,value)-pairs into
            // an object.
            let moduleArgs = {}
            for (let i = 0; i < module.command.arguments.length; i++) {
                const arg = module.command.arguments[i];
                moduleArgs[arg.name] = arg.value;
            }
            module.arguments = moduleArgs;
            // Replace the datasets in the module with a list of dataset
            // descriptors
            const moduleDatasets = [];
            for (let i = 0; i < module.datasets.length; i++) {
                // The dataset information in the module only contains the
                //identifier and the name that is used to reference the dataset.
                const ds = module.datasets[i]
                // Retrieve additional dataset metadata from the dataset
                // index.
                const desc = datasets[ds.id]
                moduleDatasets.push(
                    new DatasetDescriptor(
                        ds.id,
                        ds.name,
                        desc.columns,
                        new HATEOASReferences(desc.links)
                    )
                )
            }
            sortByName(moduleDatasets);
            module.datasets = moduleDatasets;
            // Wrap view objects in the result with a simpler object that
            // contains .name and .url properties only
            const simple_views = []
            for (let i = 0; i < module.views.length; i++) {
                const chart = module.views[i];
                simple_views.push(new ChartDescriptor().fromJson(chart));
            }
            sortByName(simple_views);
            module.views = simple_views;
            module.links = new HATEOASReferences(module.links);
            // Get cell output resource
            const stdout = module.stdout;
            let outputResource = null;
            if (stdout.length === 1) {
                // If the output is a chart view it is expected to be the only
                // output element
                const out = stdout[0];
                if (out.type === 'chart/view') {
                    outputResource = OutputChart(out.data.name, out.result);
                } else  {
                    outputResource = OutputText(stdout);
                }
            } else {
                outputResource = OutputText(stdout);
            }
            // Make sure that there is some output
            if (outputResource === null) {
                outputResource = OutputText([]);
            }
            this.cells.push(new NotebookCell(module, outputResource));
        }
        return this;
    }
    /**
     * Replace the output in the cell that represents the workflow module with
     * the given identifier. Returns a modified copy of this notebook.
     */
    replaceOutput(moduleId, outputResource) {
        // Modified list of notebook cells
        const modCells = [];
        for (let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            if (cell.module.id === moduleId) {
                modCells.push(new NotebookCell(cell.module, outputResource));
            } else {
                modCells.push(cell);
            }
        }
        return new Notebook(modCells);
    }
    showAnnotations(moduleId, annotation) {
        // Modified list of notebook cells
        const modCells = [];
        for (let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            if (cell.module.id === moduleId) {
                modCells.push(new NotebookCell(cell.module, cell.output, annotation));
            } else {
                modCells.push(cell);
            }
        }
        return new Notebook(modCells);
    }
    /**
     * Set the isFetching flag in the notebook cell that that contains the
     * module with the given id. Returns a modified copy of the notebook.
     */
    setFetching(moduleId) {
        // Modified list of notebook cells
        const modCells = [];
        for (let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            if (cell.module.id === moduleId) {
                modCells.push(
                    new NotebookCell(
                        cell.module,
                        new OutputFetching(cell.output)
                    )
                );
            } else {
                modCells.push(cell);
            }
        }
        return new Notebook(modCells);
    }
}


/**
 * Each cell in a notebook contains a corresponding workflow module and a cell
 * output resource to kkep track of the information that is shown in the cell
 * output area.
 */
class NotebookCell {
    constructor(module, output, annotationObject) {
        this.module = module;
        this.output = output;
        if (annotationObject != null) {
            this.activeDatasetCell = annotationObject
        } else {
            this.activeDatasetCell = new NoAnnotation();
        }

    }
    hasError() {
        if (this.module != null) {
            return this.module.stderr.length > 0;
        }
    }
}
