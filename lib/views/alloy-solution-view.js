'use babel';

const { Emitter } = require('event-kit');

import { select } from 'd3-selection';
import { AlloySolution } from "../alloy/alloy-solution";

export default class AlloySolutionView {

    static URI = 'atom://alloy-solution';
    static opener (uri) { if (uri === AlloySolutionView.URI) return new AlloySolutionView(); }

    div;
    emitter;
    header;
    body;
    element;

    constructor () {

        this.emitter = new Emitter();

        this.element = document
            .createElement('div');
        this.div = select(this.element)
            .attr('class', 'alloy-solution');
        this.header = this.div.append('div')
            .attr('class', 'header');
        this.body = this.div.append('div')
            .attr('class', 'body centered')
            .text('Run a Command');

    }

    setModel (model) {

        model.onInstance((solution) => this.showInstance(solution));
        model.onUnsatisfiable((solution) => this.showUnsatisfiable(solution));
        model.poke();

    }

    showInstance (solution) {

        let command = solution.getCommand().getText();

        this.header
            .selectAll('*')
            .remove();

        this.body
            .selectAll('*')
            .remove();

        this.header
            .classed('centered', true)
            .text(command);

        this.body
            .text(null)
            .classed('centered', true)
            .append('div')
            .classed('centered', true)
            .classed('button', true)
            .text('Instance found, click to view')
            .on('click', () => {
                this.emitter.emit('view');
            });

    }

    showUnsatisfiable (solution) {

        let command = solution.getCommand().getText();
        let commandType = solution.getCommand().getType();

        this.header
            .selectAll('*')
            .remove();

        this.body
            .selectAll('*')
            .remove();

        this.header
            .classed('centered', true)
            .text(command);

        this.body
            .classed('centered', true)
            .classed('clickable', false)
            .text(commandType === 'run'
                ? 'No instance found, predicate may be inconsistent.'
                : 'No counterexample found, assertion may be valid.'
            );

    }

    onView (callback) {
        return this.emitter.on('view', callback);
    }

    destroy () {
        this.element.remove();
    }

    getAllowedLocations () {
        return ['right'];
    }

    getDefaultLocation () {
        return 'right';
    }

    getElement () {
        return this.element;
    }

    getTitle () {
        return 'Alloy Solution';
    }

    getURI () {
        return AlloySolutionView.URI;
    }

}