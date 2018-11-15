'use babel';

export default class AlloyStylesView {

    static URI = 'atom://alloy-styles';
    static opener (uri) { if (uri === AlloyStylesView.URI) return new AlloyStylesView(); }

    constructor () {

        this.element = document.createElement('div');
        this.element.textContent = "Alloy Styles";

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
        return 'Alloy Styles';
    }

    getURI () {
        return AlloyStylesView.URI;
    }

}