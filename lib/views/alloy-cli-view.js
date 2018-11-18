'use babel';

import { select } from 'd3-selection';

export default class AlloyCLIView {

    static URI = 'atom://alloy-cli';
    static opener (uri) { if (uri === AlloyCLIView.URI) return new AlloyCLIView(); }

    div;
    element;

    constructor () {

        this.element = document.createElement('div');
        this.div = select(this.element)
            .attr('class', 'alloy-cli');

    }

    setModel (model) {

        model.onUpdate((lines) => this.updateLines(lines));
        this.updateLines(model.getLines());

    }

    updateLines (lines) {

        if (lines) {

            let row = this.div.selectAll('.row')
                .data(lines);

            row.exit()
                .remove();

            row = row
                .enter()
                .append('div')
                .attr('class', 'row')
                .merge(row);

            let pre = row.selectAll('.prefix')
                .data(d => [d]);

            pre.exit()
                .remove();

            pre
                .enter()
                .append('div')
                .attr('class', 'prefix')
                .merge(pre)
                .text('>>');

            let text = row.selectAll('.error,.info')
                .data(d => [d]);

            text.exit()
                .remove();

            text
                .enter()
                .append('div')
                .attr('class', d => d.clss)
                .merge(text)
                .text(d => d.text);

        }

        this.scrollDown();

    }

    scrollDown () {

        let height = this.div.property('scrollHeight');
        this.div.property('scrollTop', height);

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
        return 'Alloy CLI';
    }

    getURI () {
        return AlloyCLIView.URI;
    }

}