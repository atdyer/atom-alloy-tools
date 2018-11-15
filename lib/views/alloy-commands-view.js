'use babel';

export default class AlloyCommandsView {

    static URI = 'atom://alloy-commands';
    static opener (uri) { if (uri === AlloyCommandsView.URI) return new AlloyCommandsView(); }

    constructor () {

        this.element = document.createElement('div');
        this.element.textContent = "Alloy Commands";

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