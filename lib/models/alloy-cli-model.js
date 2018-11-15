'use babel';

export default class AlloyCLIModel {

    constructor (alloy) {

        this.lines = [];
        this.maxlines = 500;
        this.onDidUpdate = null;

        alloy.onBusy(this.addMessage);
        alloy.onError(this.addError);
        alloy.onReady(this.addMessage);
        alloy.onReady(this.addMessage);

    }

    addError (item) {
        push_limited(item, this.lines, this.maxlines);
        if (this.onDidUpdate) this.onDidUpdate();
    }

    addMessage (item) {
        push_limited(item, this.lines, this.maxlines);
        if (this.onDidUpdate) this.onDidUpdate();
    }

    addWarning (item) {
        push_limited(item, this.lines, this.maxlines);
        if (this.onDidUpdate) this.onDidUpdate();
    }

    onUpdate (callback) {
        this.onDidUpdate = callback;
    }

}

function push_limited (item, list, max) {
    if (list.push(item) > max) list.shift();
}