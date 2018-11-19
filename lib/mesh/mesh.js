'use babel';

export {
    extract_meshes,
    extract_properties
}

function extract_meshes (instance) {

    let mesh_sig_ids = ['mesh/Mesh', 'this/Mesh'],
        elem_sig_ids = ['.*/Element', 'mesh/Triangle', 'this/Triangle'],
        node_sig_ids = ['.*/Node', 'mesh/Vertex', 'this/Vertex'],
        elem_rel_ids = ['triangles'],
        edge_rel_ids = ['edges'],
        adj_rel_ids  = ['adj'];

    let mesh_sig = find_signature(instance, mesh_sig_ids),
        elem_sig = find_signature(instance, elem_sig_ids),
        node_sig = find_signature(instance, node_sig_ids),
        [elem_rel_sig, elem_rel] = find_relation(instance, mesh_sig_ids, elem_rel_ids),
        [edge_rel_sig, edge_rel] = find_relation(instance, elem_sig_ids, edge_rel_ids),
        [adj_rel_sig, adj_rel]   = find_relation(instance, mesh_sig_ids, adj_rel_ids);

    if (!mesh_sig || !elem_sig || !node_sig || !elem_rel || !edge_rel || !adj_rel)
        return {
            mesh_sig: '',
            elem_sig: '',
            node_sig: '',
            meshes: []
        };

    let mesh_atms = instance.getSignature(mesh_sig).atoms,
        mesh_elems = instance.getRelation(elem_rel, elem_rel_sig).table,
        elem_edges = instance.getRelation(edge_rel, edge_rel_sig).table;

    let meshes = [];

    // Loop through each mesh atom
    mesh_atms.forEach(mesh_atom => {

        let mesh = {
            id: mesh_atom,
            sig: mesh_sig,
            nodes: [],
            edges: [],
            elements: []
        };

        // Loop through [mesh, element] relation for this mesh
        mesh_elems.filter(mrow => mrow[0] === mesh_atom).forEach(mrow => {

            let element_atom = mrow[1];
            let element = {
                id: element_atom,
                sig: elem_sig,
                nodes: [],
                edges: []
            };

            // Loop through [element, n1, n2] relation for this element
            elem_edges.filter(erow => erow[0] === element_atom).forEach(erow => {

                // Build the node list
                let n1 = mesh.nodes.find(n => n.id === erow[1]),
                    n2 = mesh.nodes.find(n => n.id === erow[2]);

                if (!n1) {
                    n1 = {id: erow[1], sig: node_sig};
                    mesh.nodes.push(n1);
                }

                if (!element.nodes.find(n => n.id === n1.id)) element.nodes.push(n1);

                if (!n2) {
                    n2 = {id: erow[2], sig: node_sig};
                    mesh.nodes.push(n2);
                    element.nodes.push(n2);
                }

                if (!element.nodes.find(n => n.id === n2.id)) element.nodes.push(n2);

                let edge = {
                    id: n1.id + '->' + n2.id,
                    nodes: [n1, n2],
                    source: n1,
                    target: n2
                };

                mesh.edges.push(edge);
                element.edges.push(edge);

            });

            mesh.elements.push(element);

        });

        meshes.push(mesh);

    });

    return {
        mesh_sig: mesh_sig,
        elem_sig: elem_sig,
        node_sig: node_sig,
        meshes: meshes
    };

}

function extract_properties (meshes, instance) {

    let atoms = extract_atoms(meshes);
    let relations = instance.getRelations();
    let orderings = instance.getOrderings();

    let orderatoms = new Set(Object.values(orderings).reduce((acc, cur) => acc.concat(cur.atoms), []));
    let static_properties = [],
        dynamic_properties = [];

    atoms.forEach(atom => {

        relations.forEach(relation => {

            // Get the rows in this relation that start with atom
            let rows = relation.table.filter(row => row.length && row[0] === atom);

            if (rows.length) {

                // Determine if this is a static or dynamic property (or not one at all)
                let is_static = rows.length === 1 && rows[0].length === 2 && !orderatoms.has(rows[0][1]);
                let is_dynamic = rows[0].length === 3 && orderatoms.has(rows[0][2]);

                if (is_static) {

                    // Get or create the property
                    let property = static_properties
                        .find(p => p.id() === relation.id && p.signature() === relation.signature);

                    if (!property) {

                        property = property_static(relation.id, relation.signature);
                        static_properties.push(property);

                    }

                    property.set(atom, rows[0][1]);

                }

                else if (is_dynamic) {

                    // Get or create the property
                    let property = dynamic_properties
                        .find(p => p.id() === relation.id && p.signature() === relation.signature);

                    if (!property) {

                        property = property_dynamic(relation.id, relation.signature);
                        dynamic_properties.push(property);

                    }

                    property.set(atom, rows.map(r => r.slice(1, 3)));

                }

            }

        });

    });

    dynamic_properties.forEach(property => {

        let property_orders = new Set(property.orders());

        property.ordering(orderings.find(ordering => {

            return sets_equal(property_orders, new Set(ordering.atoms));

        }));

    });

    return static_properties.concat(dynamic_properties);

}

function extract_atoms (meshes) {
    let atoms = new Set();
    meshes.forEach(mesh => {
        atoms.add(mesh.id);
        mesh.nodes.forEach(node => {
            atoms.add(node.id);
        });
        mesh.elements.forEach(element => {
            atoms.add(element.id);
        });
    });
    return Array.from(atoms);
}

function find_relation (instance, signatures, options) {

    let relations = instance.getRelations();
    for (let s=0; s<signatures.length; ++s) {
        let signature = find_signature(instance, [signatures[s]]);
        if (signature) {
            let relation = options.find(id => {
                return relations.find(relation => {
                    return relation.id === id && relation.signature === signature;
                })
            });
            if (relation) {
                return [signature, relation];
            }
        }
    }

    return [null, null];

}

function find_signature (instance, options) {

    let signatures = instance.getSignatures();
    for (let o=0; o<options.length; ++o) {
        for (let s=0; s<signatures.length; ++s) {
            let regexp = new RegExp(options[o]);
            let result = regexp.exec(signatures[s].id);
            if (result) return result[0];
        }
    }

    return null;

}

function sets_equal (s1, s2) {
    if (s1.size !== s2.size) return false;
    for (const a of s1) if (!s2.has(a)) return false;
    return true;
}