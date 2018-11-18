'use babel';

import { AlloyCommand } from "../alloy/alloy-command";

const { Emitter } = require('event-kit');

class AlloyCommandsModel {

    active;
    commands;
    emitter;

    constructor (alloy) {

        this.active = false;
        this.commands = [];
        this.emitter = new Emitter();

        alloy.onBusy(() => this.setActive(false));
        alloy.onReady(() => this.setActive(true));
        alloy.onList((list) => this.setCommands(list))

    }

    getActive () {
        return this.active;
    }

    getCommands () {
        return this.commands;
    }

    onActive (callback) {
        return this.emitter.on('active', callback);
    }

    onCommands (callback) {
        return this.emitter.on('commands', callback);
    }

    setActive (isActive) {
        this.active = !!isActive;
        this.emitter.emit('active', !!isActive);
    }

    setCommands (list) {
        if (list instanceof Array && list.every(item => item instanceof AlloyCommand)) {
            this.commands = list;
            this.emitter.emit('commands', this.commands);
        }
    }

}

export {
    AlloyCommandsModel
};