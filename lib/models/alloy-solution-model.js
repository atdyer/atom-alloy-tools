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

    onInstance (callback) {
        return this.emitter.on('instance', callback);
    }

    onMeshSolution (callback) {
        return this.emitter.on('meshsolution', callback);
    }

    onUnsatisfiable (callback) {
        return this.emitter.on('unsatisfiable', callback);
    }

    poke () {
        this.setSolution(this.solution);
    }

    setSolution (solution) {

        if (solution instanceof AlloySolution) {

            this.solution = solution;

            if (solution.getType() === 'unsatisfiable') {
                this.emitter.emit('unsatisfiable', solution);
            }

            else if (solution.getType() === 'instance') {

                this.emitter.emit('instance', solution);

            }

        }
    }

}

export {
    AlloySolutionModel
};