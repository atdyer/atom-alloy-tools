'use babel';


class AlloyInstance {

    file;
    command;

    constructor (command, lines) {

        this.file = command.file;
        this.command = command;

    }

}

export {
    AlloyInstance
}