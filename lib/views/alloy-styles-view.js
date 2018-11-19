'use babel';

import { select } from 'd3-selection';

import { view_orderings } from "../mesh/view-orderings";
import { view_styles } from "../mesh/view-styles";

export default class AlloyStylesView {

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

        let solution = model.getSolution();
        let instance = solution.getInstance();
        let properties = model.getProperties();
        let styles = model.getStyles();
        let orderings = instance.getOrderings();

        let orderview = view_orderings(orderings, properties);
        let styleview = view_styles(styles, properties);

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

    getTitle () {
        return 'Alloy Styles';
    }

    getURI () {
        return AlloyStylesView.URI;
    }

}