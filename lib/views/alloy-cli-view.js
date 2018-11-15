'use babel';

import { select } from 'd3-selection';

export default class AlloyCLIView {

    static URI = 'atom://alloy-cli';
    static opener (uri) { if (uri === AlloyCLIView.URI) return new AlloyCLIView(); }

    constructor () {

        this.element = document.createElement('div');
        this.div = select(this.element)
            .attr('class', 'alloy-cli');

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