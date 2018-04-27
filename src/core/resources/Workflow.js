import { BranchDescriptor } from './Branch';
import { ChartDescriptor } from './Chart';
import { DatasetDescriptor } from './Dataset';
import { HATEOASReferences } from '../util/HATEOAS';
import { sortByName } from '../util/Sort';
import { utc2LocalTime } from '../util/Timestamp';


/**
 * Descriptor for a workflow version in a branch history. Contains the version
 * number of the workflow, time of creation, type of action that created the
 * workflow, and a short text describing the type of module that was affected
 * by the action.
 */
export class WorkflowDescriptor {
    constructor(version, createdAt, action, statement) {
        this.version = version;
        this.createdAt = createdAt;
        this.action = action;
        this.statement = statement;
    }
    /**
     * Initialize the workflow descriptor from a Json object that contains the
     * serialization of a WorkflowDescriptor returned by the Web API.
     */
    fromJson(json) {
        this.version = json.version;
        this.createdAt = utc2LocalTime(json.createdAt);
        this.action = json.action;
        this.statement = json.statement;
        return this;
    }
    /**
     * Helper functions to determine the action type that created the workflow
     * version There are four possible action types: CREATE BRANCH, DELETE
     * MODULE, INSERT (or APPEND) MODULE, and REPLACE MODULE.
     */
    actionIsCreate = () => (this.action === 'cre');
    actionIsDelete = () => (this.action === 'del');
    actionIsInsert = () => (this.action === 'ins');
    actionIsReplace = () => (this.action === 'upd');
}


/**
 * Handle for curation workflow. Contains information about the workflow itself
 * and the resources (i.e., datasets and charts) in the workflow state.
 *
 * For now the workflow handle also contains a read)nly flag to indicate whether
 * the workflow can be modified by the user via the web app. This shold be
 * replaced in the future when proper authentication and access control is
 * implemented.
 */
export class WorkflowHandle {
    constructor(version, createdAt, branch, datasets, charts, readOnly, links) {
        this.version = version;
        this.createdAt = createdAt;
        this.branch = branch;
        this.datasets = datasets;
        this.charts = charts;
        this.readOnly = readOnly;
        this.links = links;
    }
    /**
     * Initialize the workflow handle from a Json object containing a
     * WorkflowHandle returned by the Web API.
     */
    fromJson(json) {
        this.version = json.version;
        this.createdAt = utc2LocalTime(json.createdAt);
        this.branch = new BranchDescriptor().fromJson(json.branch);
        // Create an list of descriptors for datasets that are present in the
        // workflow state. Datasets are sorted by their name.
        this.datasets = [];
        for (let i = 0; i < json.state.datasets.length; i++) {
            const ds = new DatasetDescriptor().fromJson(json.state.datasets[i]);
            this.datasets.push(ds);
        }
        sortByName(this.datasets);
        // Create an list of descriptors for chart views that are present in the
        // workflow state. Charts are sorted by their name.
        this.charts = [];
        for (let i = 0; i < json.state.charts.length; i++) {
            const chart = new ChartDescriptor().fromJson(json.state.charts[i]);
            this.charts.push(chart);
        }
        sortByName(this.charts);
        // Read-only flag
        this.readOnly = json.readOnly;
        // Is empty flag
        this.isEmpty = (json.state.moduleCount === 0);
        // Workflow HATEOAS references
        this.links = new HATEOASReferences(json.links);
        return this;
    }
    /**
     * Create a copy of the workflow handle where the branch is replaced with
     * the given value.
     */
    updateBranch(branch) {
        const { version, createdAt, datasets, charts, readOnly, links } = this;
        return new WorkflowHandle(
            version,
            createdAt,
            branch,
            datasets,
            charts,
            readOnly,
            links
        );
    }
}
