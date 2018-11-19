'use babel';

const { Emitter } = require('event-kit');

import {AlloyTask} from "../alloy/alloy-task";
import {AlloyError} from "../alloy/alloy-error";

class AlloyCLIModel {

    emitter;
    lines;
    maxlines;

    constructor (alloy) {

        this.emitter = new Emitter();
        this.lines = [];
        this.maxlines = 500;

        alloy.onBusy((task) => {
            if (task instanceof AlloyTask)
                this.addMessage(task.description + '...');
        });

        alloy.onError((err) => {
            if (err instanceof AlloyError) {
                this.addError(err.description);
                if (err.data) err.data.forEach(line => this.addError(line));
            }
        });

        alloy.onInfo((info) => {
            this.addMessage(info.info);
        });

        alloy.onList((list) => {
            this.addMessage(`Found ${list.length} commands`);
        });

        alloy.onReady(() => {
            this.addMessage('Ready');
        });

    }

    addError (text) {

        let item = {
            clss: 'error',
            text: text
        };

        push_limited(item, this.lines, this.maxlines);
        this.emitter.emit('update', this.lines);
    }

    addMessage (text) {

        let item = {
            clss: 'info',
            text: text
        };

        push_limited(item, this.lines, this.maxlines);
        this.emitter.emit('update', this.lines);
    }

    clear () {

        this.lines = [];
        this.emitter.emit('update', this.lines);

    }

    getLines () {
        return this.lines;
    }

    onUpdate (callback) {
        return this.emitter.on('update', callback);
    }

}

function push_limited (item, list, max) {
    if (list.push(item) > max) list.shift();
}

export {
    AlloyCLIModel
};