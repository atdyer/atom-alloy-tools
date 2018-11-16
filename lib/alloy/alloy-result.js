'use babel';

import { AlloyCommand } from "./alloy-command";
import { AlloyInstance } from "./alloy-instance";

class AlloyResult {

    file;
    command;
    type;
    instance;

    constructor (file, lines) {

        this.file = file;

        if (lines.length > 2) {

            this.command = new AlloyCommand(file, lines[0]);

            if (lines[1] === '---INSTANCE---') {

                this.type = 'instance';
                this.instance = new AlloyInstance(this.command, lines.slice(2));

            }

            else if (lines[1] === '---OUTCOME---' && lines[2] === 'Unsatisfiable.') {

                this.type = 'unsatisfiable';

            }

        }

    }

}

export {
    AlloyResult
};