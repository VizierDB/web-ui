import { getProperty } from '../util/Api';
import { HATEOASReferences } from '../util/HATEOAS';

/**
 * Identifier of the default branch for curation projects.
 */
export const DEFAULT_BRANCH = 'master'


// -----------------------------------------------------------------------------
// Classes
// -----------------------------------------------------------------------------

/**
 * Descriptor for a project branch. Contains the basic information about the
 * branch (i.e., .id, .name, and .links).
 */
export class BranchDescriptor {
    constructor(id, name, links) {
        this.id = id;
        this.name = name;
        this.links = links;
    }
    /**
     * Initialize the descriptor from a Json object that is a BranchDescriptor
     * serialization returned by the Web API.
     */
    fromJson(json) {
        this.id = json.id;
        this.name = getProperty(json, 'name', 'undefined');
        this.links = new HATEOASReferences(json.links);
        return this;
    }
}
