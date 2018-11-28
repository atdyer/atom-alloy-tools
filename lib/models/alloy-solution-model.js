'use babel';

import { extract_meshes, extract_properties } from "../mesh/mesh-util";
import { style_color } from "../mesh/style-color";
import { style_value } from "../mesh/style-value";

const { Emitter } = require('event-kit');

import { AlloySolution } from "../alloy/alloy-solution";

class AlloySolutionModel {

    emitter;
    solution;
    type;

    meshinfo;
    properties;
    styles;

    constructor (alloy) {

        this.emitter = new Emitter;
        this.styles = [];

        alloy.onSolution((result) => this.setSolution(result));

    }


    getMeshes () {
        return this.meshinfo ? this.meshinfo.meshes : null;
    }

    getProperties () {
        return this.properties;
    }

    getSolution () {
        return this.solution;
    }

    getSolutionType () {
        return this.type;
    }

    getStyles () {
        return this.styles;
    }

    onInstance (callback) {
        return this.emitter.on('instance', callback);
    }

    onMeshSolution (callback) {
        return this.emitter.on('meshsolution', callback);
    }

    onUnsatisfiable (callback) {
        return this.emitter.on('unsatisfiable', callback);
    }

    setSolution (solution) {

        if (solution instanceof AlloySolution) {

            this.solution = solution;

            if (solution.getType() === 'unsatisfiable') {

                this.type = 'unsatisfiable';
                this.meshinfo = null;
                this.properties = null;

                this.emitter.emit('unsatisfiable', solution);

            }

            else if (solution.getType() === 'instance') {

                let instance = solution.getInstance();
                this.meshinfo = extract_meshes(instance);
                this.properties = extract_properties(this.meshinfo.meshes, instance);

                if (this.meshinfo.meshes.length) {

                    this.type = 'meshsolution';
                    let node_sig = this.meshinfo.node_sig;
                    let elem_sig = this.meshinfo.elem_sig;

                    this.styles = [
                        style_value().class(node_sig).display_name('Radius').property('r').default(15).attr(true),
                        style_color().class(node_sig).display_name('Fill').property('fill').default('white'),
                        style_color().class(node_sig).display_name('Stroke').property('stroke').default('#353b45'),
                        style_value().class(node_sig).display_name('Stroke Width').property('stroke-width').default(2),
                        style_color().class(elem_sig).display_name('Fill').property('fill').default('transparent'),
                        style_color().class(elem_sig).display_name('Stroke').property('stroke').default('white'),
                        style_value().class(elem_sig).display_name('Stroke Width').property('stroke-width').default(1),
                        style_color().class(elem_sig).display_name('Font Color').property('fill').default('white').label(true)
                    ];

                    let args = {
                        solution: this.solution,
                        meshes: this.meshinfo.meshes,
                        properties: this.properties,
                        styles: this.styles
                    };

                    this.emitter.emit('meshsolution', args);

                } else {

                    this.type = 'instance';
                    this.meshinfo = null;
                    this.properties = null;
                    this.emitter.emit('instance', solution);

                }

            }

        }
    }

}

export {
    AlloySolutionModel
};