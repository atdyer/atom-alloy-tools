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

        if (lines.length > 2) {

            this.command = new AlloyCommand(file, lines[1]);

            if (lines[2] === '---INSTANCE---') {

                this.type = 'instance';
                this.instance = new AlloyInstance(this.command, lines.slice(2));

            }

            else if (lines[2] === '---OUTCOME---' && lines[3] === 'Unsatisfiable.') {

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