'use babel';

import { select } from 'd3-selection';

import { view_orderings } from "../mesh/view-orderings";
import { view_styles } from "../mesh/view-styles";
import { style_value } from "../mesh/style-value";
import { style_color } from "../mesh/style-color";

const { Emitter } = require('event-kit');

class AlloyStylesView {

    static URI = 'atom://alloy-styles';
    static opener (uri) { if (uri === AlloyStylesView.URI) return new AlloyStylesView(); }

    constructor () {

        this.element = document.createElement('div');
        this.div = select(this.element);

    }

    destroy () {
        this.element.remove();
    }

    setModel (model) {

        this.model = model;

        let properties = model.getProperties();
        let styles = model.getStyles();
        let orderings = model.getOrderings();

        let orderview = view_orderings(orderings, properties);
        let styleview = view_styles(styles, properties);

        orderview.on_change(() => model.setNeedsUpdate());
        styleview.on_update(() => model.setNeedsUpdate());

        this.div.selectAll('*').remove();
        orderview(this.div);
        styleview(this.div);

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

    getModel () {
        return this.model;
    }

    getTitle () {
        return 'Alloy Styles';
    }

    getURI () {
        return AlloyStylesView.URI;
    }

}

function defaultStyles (node_sig, elem_sig) {
    return [
        style_value().class(node_sig).display_name('Radius').property('r').default(15).attr(true),
        style_color().class(node_sig).display_name('Fill').property('fill').default('white'),
        style_color().class(node_sig).display_name('Stroke').property('stroke').default('#21252b'),
        style_value().class(node_sig).display_name('Stroke Width').property('stroke-width').default(4),
        style_color().class(elem_sig).display_name('Fill').property('fill').default('transparent'),
        style_color().class(elem_sig).display_name('Stroke').property('stroke').default('white'),
        style_value().class(elem_sig).display_name('Stroke Width').property('stroke-width').default(1),
        style_color().class(elem_sig).display_name('Font Color').property('fill').default('white').label(true)
    ]
}

export {
    AlloyStylesView,
    defaultStyles
}