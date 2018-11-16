'use babel';


class AlloyError {

    file;
    type;
    description;

    constructor (file, type, description) {
        this.file = file;
        this.type = type;
        this.description = description;
    }

}

export {
    AlloyError
};