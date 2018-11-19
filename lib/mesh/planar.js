'use babel';

export { embed_planar_mesh };

function embed_planar_mesh (mesh, cx, cy, r) {

    // Set defaults if needed
    cx = cx || 0;
    cy = cy || 0;
    r = r || 80;

    // Inialize positional properties for each node and build node map
    let node_map = {};
    mesh.nodes.forEach(node => {
        node.x = cx;
        node.y = cy;
        node.fixed = false;
        node_map[node.id] = node;
    });

    // Create vertex neighborhoods and list of all edges
    let neighborhood = {},
        edges = [];

    mesh.elements.forEach(element => {

        element.edges.forEach(edge => {

            let n1 = edge.nodes[0],
                n2 = edge.nodes[1];

            if (!(n1.id in neighborhood)) neighborhood[n1.id] = new Set();
            if (!(n2.id in neighborhood)) neighborhood[n2.id] = new Set();
            neighborhood[n1.id].add(n2);
            neighborhood[n2.id].add(n1);
            edges.push(edge);

        });

    });

    forEachItem(neighborhood, (node, neighbors) => {

        neighborhood[node] = Array.from(neighbors);

    });

    // Determine half-edges
    let halves = new Set(),
        edge;

    while (edge = edges.pop()) {

        let e = edge.nodes.map(n => n.id).join('->'),
            r = [edge.nodes[1].id, edge.nodes[0].id].join('->');

        if (halves.has(r)) {
            halves.delete(r);
        } else {
            halves.add(e);
        }

    }

    halves = Array.from(halves).map(e => e.split('->'));

    // Create a map that contains the outer ring of the mesh
    let ring = {};
    halves.forEach(h => ring[h[0]] = h[1]);

    // Get the set of vertices that are on the outer boundary
    let ring_vertices = new Set();
    halves.forEach(h => {
        ring_vertices.add(h[0]);
        ring_vertices.add(h[1]);
    });
    ring_vertices = Array.from(ring_vertices);

    // Determine the angle that will separate vertices and place ring nodes
    let angle = 360 / ring_vertices.length;
    let start = ring_vertices[0],
        v = start,
        ng = 0;

    node_map[start].x = cx + r * Math.cos(ng * Math.PI / 180);
    node_map[start].y = cy + r * Math.sin(ng * Math.PI / 180);
    node_map[start].fixed = true;

    while ((v = ring[v]) !== start) {

        ng += angle;
        node_map[v].x = cx + r * Math.cos(ng * Math.PI / 180);
        node_map[v].y = cy + r * Math.sin(ng * Math.PI / 180);
        node_map[v].fixed = true;

    }

    // Iteratively place the rest of the nodes using the averaging method
    let biggest_move = Infinity,
        tolerance = 1;

    while (biggest_move > tolerance) {

        let biggest_it = 0;

        mesh.nodes.forEach(node => {

            if (!node.fixed) {

                let neighbors = neighborhood[node.id];
                let x = neighbors.reduce((acc, neighbor) => acc + neighbor.x, 0) / neighbors.length;
                let y = neighbors.reduce((acc, neighbor) => acc + neighbor.y, 0) / neighbors.length;
                let dist = Math.sqrt((node.x - x)**2 + (node.y - y)**2);
                node.x = x;
                node.y = y;
                node.fixed = true;

                if (dist > biggest_it) biggest_it = dist;

            }

        });

        biggest_move = biggest_it;

    }

    return mesh;

}

function forEachItem (obj, callback) {
    for (const k in obj) {
        if (obj.hasOwnProperty(k)) {
            callback(k, obj[k]);
        }
    }
}