'use babel';


class AlloyInstance {

    file;
    command;

    univ;
    signatures;
    relations;

    constructor (command, lines) {

        this.file = command.file;
        this.command = command;

        this.signatures = lines
            .map(parse_signature_line)
            .filter(item => item !== undefined)
            .map(parse_signature);

        this.relations = lines
            .map(parse_relation_line)
            .filter(item => item !== undefined)
            .map(([sig_string, set_string]) => parse_relation(this.signatures, sig_string, set_string));

        this.univ = new Set();
        this.signatures.forEach(sig => sig.atoms.forEach(atom => this.univ.add(atom)));

    }

    getAtoms () {
        return Array.from(this.univ);
    }

    getCommand () {
        return this.command;
    }

    getOrderings () {
        return extract_time_signatures(this.signatures, this.relations);
    }

    getRelation (relation, signature) {
        return this.relations.find(r => r.id === relation && r.signature === signature);
    }

    getRelations () {
        return this.relations;
    }

    getSignature (signature) {
        return this.signatures.find(s => s.id === signature);
    }

    getSignatures () {
        return this.signatures;
    }

}


function extract_time_signatures (signatures, relations) {

    // First get all signatures that are ordered using util/ordering

    let timesigs = {};
    // let relations = instance.relations();
    let firsts = relations.filter(relation => relation.id === 'First');
    let nexts = relations.filter(relation => relation.id === 'Next');

    firsts.forEach(relation => {

        let table = relation.table;
        if (table.length === 1 && table[0].length === 2) {
            timesigs[relation.signature] = [table[0][1]];
        }

    });

    nexts.forEach(relation => {

        let sig = relation.signature;
        if (sig in timesigs) {

            let table = relation.table;
            if (table.length > 0 && table[0].length === 3) {

                let next = {};
                table.forEach(row => {
                    next[row[1]] = row[2];
                });

                let last = timesigs[sig].pop();
                while (last) {
                    let curr = next[last];
                    timesigs[sig].push(last);
                    last = curr;
                }

            }

        }

    });

    // Next look for additional signatures that contain ALL of the atoms
    // from the signatures that were ordered with util/ordering
    let orderatoms = new Set(Object.values(timesigs).reduce((acc, cur) => acc.concat(cur), []));
    timesigs = signatures.filter(signature => {
        let atomset = new Set(signature.atoms);
        return sets_equal(atomset, orderatoms);
    });

    return timesigs;

}

function parse_relation (signatures, sig_string, set_string) {

    let [sig, rel] = sig_string.split('<:');
    let content = set_string.slice(1, -1);

    let signature = signatures.find(s => s.id === sig);
    let relation_table = content.split(',').map(row => row.trim().split('->'));

    if (relation_table.length === 1 && relation_table[0][0] === '') relation_table = [];

    if (signature) {
        signature.relations.push(rel);
        return {
            id: rel,
            signature: sig,
            table: relation_table
        };
    }


}

function parse_relation_line (line) {

    let dat = line.split('=');

    if (dat.length === 2 && dat[0].includes('<:')) {

        return [dat[0], dat[1]];

    }

}

function parse_signature ([sig_string, set_string]) {

    let content = set_string.slice(1, -1);

    return {
        id: sig_string,
        atoms: content.split(',').map(atom => {
            atom = atom.trim();
            return atom;
        }),
        relations: []
    };

}

function parse_signature_line (line) {

    let dat = line.split('=');

    if (dat.length === 2 && !dat[0].includes('<:')) {

        return [dat[0], dat[1]];

    }

}

function sets_equal (s1, s2) {
    if (s1.size !== s2.size) return false;
    for (const a of s1) if (!s2.has(a)) return false;
    return true;
}

export {
    AlloyInstance
}