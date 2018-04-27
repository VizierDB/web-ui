import { HATEOASReferences } from '../util/HATEOAS';


/**
 * Chart view descriptor containing name and links. Chart views don't have
 * separate unique identifier at the moment. The chart name is used as the
 * unique object identifier.
 */
export class ChartDescriptor {
    constructor(name, links) {
        this.id = name;
        this.name = name;
        this.links = links;
    }
    /**
     * Initialize from a Json object that contains a WorkflowResource returned
     * by the Web API.
     */
    fromJson(json) {
        this.id = json.name;
        this.name = json.name;
        this.links = new HATEOASReferences(json.links);
        return this;
    }
}
