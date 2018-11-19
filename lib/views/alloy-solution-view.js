'use babel';

const { Emitter } = require('event-kit');

import { select } from 'd3-selection';
import { view_meshes } from "../mesh/view-meshes";

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
        model.onMeshSolution((solution) => this.showMeshes(solution));
        model.onUnsatisfiable((solution) => this.showUnsatisfiable(solution));

        let type = model.getSolutionType();

        if (type === 'unsatisfiable')
            this.showUnsatisfiable(model.getSolution());

        else if (type === 'instance')
            this.showInstance(model.getSolution());

        else if (type === 'meshsolution')
            this.showMeshes({
                solution: model.getSolution(),
                meshes: model.getMeshes(),
                properties: model.getProperties(),
                styles: model.getStyles()
            });

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
            .classed('header', true)
            .classed('header-mesh', false)
            .classed('centered', true)
            .text(command);

        this.body
            .text(null)
            .classed('centered', true)
            .append('div')
            .classed('centered', true)
            .classed('button', true)
            .text('Instance found, click to view in Alloy')
            .on('click', () => {
                this.emitter.emit('view');
            });

    }

    showMeshes ({solution, meshes, properties, styles}) {

        let meshview = view_meshes(meshes);
        styles.forEach(styler => meshview.style(styler));

        let command = solution.getCommand().getText();

        this.header
            .selectAll('*')
            .remove();

        this.body
            .selectAll('*')
            .remove();

        this.header
            .classed('header', false)
            .classed('header-mesh', true)
            .classed('centered', false)
            .on('click', () => {
                this.emitter.emit('openmesh', {
                    title: solution.getCommand().getText(),
                    longtitle: solution.getFile() + ': ' + solution.getCommand().getText()
                });
            });

        this.header
            .append('span')
            .attr('class', 'prefix icon icon-eye');

        this.header
            .append('div')
            .attr('class', 'content')
            .text(command);

        let svg = this.body
            .text(null)
            .classed('centered', true)
            .append('svg');

        meshview(svg);

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
            .classed('header', true)
            .classed('header-mesh', false)
            .text(command);

        this.body
            .classed('centered', true)
            .classed('clickable', false)
            .text(commandType === 'run'
                ? 'No instance found, predicate may be inconsistent.'
                : 'No counterexample found, assertion may be valid.'
            );

    }

    onOpenMesh (callback) {
        return this.emitter.on('openmesh', callback);
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