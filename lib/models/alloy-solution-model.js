'use babel';

const { Emitter } = require('event-kit');

import { AlloySolution } from "../alloy/alloy-solution";

class AlloySolutionModel {

    emitter;
    solution;

    constructor (alloy) {

        this.emitter = new Emitter;

        alloy.onSolution((result) => this.setSolution(result));

    }

    onMeshes (callback) {
        return this.emitter.on('meshes', callback);
    }

    onUnsatisfiable (callback) {
        return this.emitter.on('unsatisfiable', callback);
    }

    setSolution (solution) {

        if (solution instanceof AlloySolution) {

            this.solution = solution;

            if (solution.getType() === 'unsatisfiable') {
                this.emitter.emit('unsatisfiable', solution);
            }

        }
    }

}

export {
    AlloySolutionModel
};