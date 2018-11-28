'use babel';

import { extract_meshes, extract_properties } from "../mesh/mesh-util";
import { defaultStyles } from "../views/alloy-styles-view";

const { Emitter } = require('event-kit');

class AlloyMeshModel {

    emitter;

    constructor (solution) {

        // Create the emitter
        this.emitter = new Emitter;

        // Get the instance
        let instance = solution.getInstance();

        // Extract the meshes from the instance
        let meshinfo = extract_meshes(instance);
        this.meshes = meshinfo.meshes;

        if (this.meshes.length) {

            // Extract mesh properties from the meshes
            this.properties = extract_properties(meshinfo.meshes, instance);
            let node_sig = meshinfo.node_sig;
            let elem_sig = meshinfo.elem_sig;

            // Start with default styles
            this.styles = defaultStyles(node_sig, elem_sig);

        } else {

            this.properties = [];
            this.styles = [];

        }

        // Extract any orderings
        this.orderings = instance.getOrderings();

        // Create titles
        this.longtitle = solution.getFile() + ': ' + solution.getCommand().getText();
        this.title = solution.getCommand().getText();

    }

    onNeedsUpdate (callback) {
        return this.emitter.on('needs-update', callback);
    }

    getLongTitle () {
        return this.longtitle;
    }

    getOrderings () {
        return this.orderings;
    }

    getMeshes () {
        return this.meshes;
    }

    getPath () {
        return this.getLongTitle();
    }

    getProperties () {
        return this.properties;
    }

    getStyles () {
        return this.styles;
    }

    getTitle () {
        return this.title;
    }

    setNeedsUpdate () {
        this.emitter.emit('needs-update');
    }

}

export {
    AlloyMeshModel
}