'use babel';


class AlloyError {

    file;
    description;
    data;

    constructor (file, description, data) {
        this.file = file;
        this.description = description;
        this.data = data;
    }

}

export {
    AlloyError
};