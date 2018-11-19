'use babel';

import { select } from 'd3-selection';
import { view_meshes } from "../mesh/view-meshes";

export default class AlloyMeshView {

    static URI = 'atom://alloy-meshes';
    static opener (uri, options) { if (uri === AlloyMeshView.URI) return new AlloyMeshView(options); }

    constructor (options) {

        this.title = options.title;
        this.longtitle = options.longtitle;

        this.element = document.createElement('div');
        this.div = select(this.element).classed('alloy-mesh', true);
        this.svg = this.div.append('svg');

    }

    destroy () {
        this.element.remove();
    }

    setModel (model) {

        let meshes = model.getMeshes();
        let styles = model.getStyles();
        let view = view_meshes(meshes);
        styles.forEach(styler => view.style(styler));

        view(this.svg);

    }

    getAllowedLocations () {
        return ['center'];
    }

    getDefaultLocation () {
        return 'center';
    }

    getElement () {
        return this.element;
    }

    getLongTitle () {
        return this.longtitle;
    }

    getPath () {
        return this.getLongTitle();
    }

    getTitle () {
        return this.title;
    }

    getURI () {
        return AlloyMeshView.URI;
    }

}