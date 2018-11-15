'use babel';

export default class AlloySolutionView {

    static URI = 'atom://alloy-solution';
    static opener (uri) { if (uri === AlloySolutionView.URI) return new AlloySolutionView(); }

    constructor () {

        this.element = document.createElement('div');
        this.element.textContent = "Alloy Solution";

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