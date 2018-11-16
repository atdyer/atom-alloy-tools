'use babel';

class AlloyCommandList {

    commands;
    file;

    constructor (file, lines) {

        this.file = file;

        if (lines.length > 1) {

            this.commands = lines.slice(1).map(line => new AlloyCommand(file, line));

        }

    }



}

class AlloyCommand {

    index;
    command;
    file;

    constructor (file, line) {

        this.file = file;

        let dat = line.split(':');
        if (dat.length === 2) {
            this.index = parseInt(dat[0]);
            this.command = dat[1];
        }

    }

    equals (other) {
        return this.index === other.index &&
            this.command === other.command &&
            this.file === other.file;
    }

}

export {
    AlloyCommand,
    AlloyCommandList
};