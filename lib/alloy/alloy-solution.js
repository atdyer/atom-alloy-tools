'use babel';

import { AlloyCommand } from "./alloy-command";
import { AlloyInstance } from "./alloy-instance";

class AlloySolution {

    file;
    command;
    type;
    instance;

    constructor (file, lines) {

        this.file = file;

        if (lines.length > 1) {

            this.command = new AlloyCommand(file, lines[0]);

            if (lines[1] === '---INSTANCE---') {

                this.type = 'instance';
                this.instance = new AlloyInstance(this.command, lines.slice(1));

            }

            else if (lines[1] === '---OUTCOME---' && lines[2] === 'Unsatisfiable.') {

                this.type = 'unsatisfiable';

            }

        }

    }

    getCommand() {
        return this.command;
    }

    getFile () {
        return this.file;
    }

    getInstance () {
        return this.instance;
    }

    getType () {
        return this.type;
    }

}

export {
    AlloySolution
};