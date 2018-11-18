'use babel';

const { Emitter } = require('event-kit');

import { select } from 'd3-selection';

export default class AlloyCommandsView {

    static URI = 'atom://alloy-commands';
    static opener (uri) { if (uri === AlloyCommandsView.URI) return new AlloyCommandsView(); }

    div;
    element;
    emitter;
    isactive;

    constructor () {

        this.emitter = new Emitter();
        this.isactive = false;

        this.element = document.createElement('div');
        this.div = select(this.element)
            .attr('class', 'alloy-commands');

    }

    setModel (model) {

        model.onActive((isactive) => this.updateActive(isactive));
        model.onCommands((commands) => this.updateCommands(commands));
        this.updateActive(model.getActive());
        this.updateCommands(model.getCommands());

    }

    onSelect (callback) {
        this.emitter.on('select', callback);
    }

    updateActive (isactive) {

        this.isactive = isactive;

        this.div
            .selectAll('.row')
            .classed('active', isactive);

    }

    updateCommands (commands) {

        if (commands) {

            let row = this.div.selectAll('.row')
                .data(commands);

            row.exit()
                .remove();

            row = row
                .enter()
                .append('div')
                .attr('class', 'row')
                .merge(row);

            row
                .classed('active', this.isactive)
                .on('click', (command, index, rows) => {

                    if (select(rows[index]).classed('active')) {
                        this.emitter.emit('select', command);
                    }

                });

            let pre = row.selectAll('.prefix')
                .data(d => [d]);

            pre.exit()
                .remove();

            pre
                .enter()
                .append('span')
                .attr('class', 'prefix icon')
                .merge(pre)
                .classed('icon-check', d => d.getType() === 'check')
                .classed('icon-zap', d => d.getType() === 'run');

            let text = row.selectAll('.content')
                .data(d => [d]);

            text.exit()
                .remove();

            text
                .enter()
                .append('div')
                .attr('class', 'content')
                .merge(text)
                .text(d => d.command);

        }


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
        return 'Alloy Commands';
    }

    getURI () {
        return AlloyCommandsView.URI;
    }

}