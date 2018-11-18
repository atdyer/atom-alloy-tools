'use babel';

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

    getText () {
        return this.command;
    }

    getType () {
        let lower = this.command.toLowerCase();
        let check = lower.indexOf('check');
        let run = lower.indexOf('run');
        return check === run ? 'unknown' :
            check > run ? 'check' : 'run';
    }

}

export {
    AlloyCommand
};