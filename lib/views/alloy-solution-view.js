'use babel';

import { select } from 'd3-selection';

export default class AlloySolutionView {

    static URI = 'atom://alloy-solution';
    static opener (uri) { if (uri === AlloySolutionView.URI) return new AlloySolutionView(); }

    div;
    header;
    body;
    element;

    constructor () {

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

        model.onUnsatisfiable((solution) => this.showUnsatisfiable(solution));

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
            .text(commandType === 'run'
                ? 'No instance found, predicate may be inconsistent.'
                : 'No counterexample found, assertion may be valid.'
            );

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