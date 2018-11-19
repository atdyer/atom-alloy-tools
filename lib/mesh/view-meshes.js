'use babel';

import { event, select } from 'd3-selection';
import { drag } from 'd3-drag';
import { line } from 'd3-shape';
import { embed_planar_mesh } from "./planar";

export { view_meshes };

function view_meshes (meshes) {

    let mesh,
        styles = [];

    function view (svg) {

        mesh = svg.selectAll('.mesh')
            .data(meshes, function (mesh) { return mesh.id ? mesh.id : this.id; });

        mesh.exit()
            .remove();

        mesh = mesh
            .enter()
            .append('g')
            .attr('class', 'mesh')
            .attr('id', m => m.id)
            .merge(mesh);

        svg.call(drag()
            .container(svg.node())
            .subject(dragsubject)
            .on('drag', dragged)
        );

        let width = parseInt(svg.style('width')),
            height = parseInt(svg.style('height'));

        initialize_layout(width, height);

    }

    view.style = function (styler) {
        styles.push(styler);
    };

    view.styles = function () {
        return styles;
    };

    view.update = function (width, height) {

        if (mesh) {

            if (width && height) reposition(width, height);

            // Links
            let links = layout_links();
            position_links(links);

            // Elements
            let elements = layout_elements();
            position_elements(elements);

            // Nodes
            let nodes = layout_nodes();
            position_nodes(nodes);

            // Node labels
            let node_labels = layout_node_labels();
            position_node_labels(node_labels);

            // Element labels
            let element_labels = layout_element_labels();
            position_element_labels(element_labels);

            // Apply all styles
            apply_styles();

        }

    };

    function apply_styles () {

        styles.forEach(styler => {

            styler(mesh.selectAll('*'));

        });

    }

    function build_rectangles (count, width, height) {

        let rectangles = [{
            l: 0,
            r: width,
            t: 0,
            b: height
        }];

        while (rectangles.length < count) {

            let rect = rectangles.shift(),
                w = rect.r - rect.l,
                h = rect.b - rect.t,
                cx = (rect.r + rect.l) / 2,
                cy = (rect.b + rect.t) / 2;

            if (w > h) {
                rectangles.push({
                    l: rect.l,
                    r: cx,
                    t: rect.t,
                    b: rect.b
                });
                rectangles.push({
                    l: cx,
                    r: rect.r,
                    t: rect.t,
                    b: rect.b
                });
            } else {
                rectangles.push({
                    l: rect.l,
                    r: rect.r,
                    t: rect.t,
                    b: cy
                });
                rectangles.push({
                    l: rect.l,
                    r: rect.r,
                    t: cy,
                    b: rect.b
                });
            }

        }

        return rectangles;

    }

    function centroid_x (node_list) {
        return node_list.reduce((s, n) => s + n.x, 0) / node_list.length;
    }

    function centroid_y (node_list) {
        return node_list.reduce((s, n) => s + n.y, 0) / node_list.length;
    }

    function dragsubject () {
        return find_node(event.x, event.y);
    }

    function dragged () {
        event.subject.x = event.x;
        event.subject.y = event.y;
        if (mesh) {
            position_elements(mesh.selectAll('.element'));
            position_links(mesh.selectAll('.link'));
            position_nodes(mesh.selectAll('.node'));
            position_node_labels(mesh.selectAll('.nodelabel'));
            position_element_labels(mesh.selectAll('.elementlabel'));
        }
    }

    function find_node (x, y, radius) {

        if (mesh) {

            let data = mesh.selectAll('.node').data(),
                n = data.length,
                i,
                dx,
                dy,
                d2,
                node,
                closest;

            if (radius == null) radius = Infinity;
            else radius *= radius;

            for (i = 0; i < n; ++i) {
                node = data[i];
                dx = x - node.x;
                dy = y - node.y;
                d2 = dx * dx + dy * dy;
                if (d2 < radius) closest = node, radius = d2;
            }

            return closest;

        }

    }

    function initialize_layout (width, height) {

        // Calculate rectangles
        let rectangles = build_rectangles(meshes.length, width, height);

        // Place nodes for each mesh in a separate rectangle
        meshes.forEach((mesh, i) => {

            let rect = rectangles[i],
                w = rect.r - rect.l,
                h = rect.b - rect.t,
                cx = (rect.r + rect.l) / 2,
                cy = (rect.t + rect.b) / 2,
                r = (Math.min(w, h) / 2) - 30;

            embed_planar_mesh(mesh, cx, cy, r);

        });

        view.update(width, height);

    }

    function layout_elements () {

        let elements = mesh.selectAll('.element')
            .data(mesh => mesh.elements, function (element) { return element.id ? element.id : this.id });

        elements.exit()
            .remove();

        elements = elements
            .enter()
            .append('polygon')
            .attr('class', 'element')
            .attr('id', e => e.id)
            .merge(elements)
            .each(function (d) {
                select(this).classed(d.sig, true);
            });

        return elements;

    }

    function layout_element_labels () {

        let labels = mesh.selectAll('.elementlabel')
            .data(mesh => mesh.elements, function (element) { return element.id ? element.id : this.id });

        labels.exit()
            .remove();

        labels = labels
            .enter()
            .append('text')
            .text(d => d.id.split('$').pop())
            .attr('class', 'label elementlabel')
            .attr('id', element => element.id)
            .attr('dy', '0.31em')
            .style('text-anchor', 'middle')
            .style('-webkit-user-select', 'none')
            .style('-moz-user-select', 'none')
            .style('-ms-user-select', 'none')
            .style('user-select', 'none')
            .merge(labels)
            .each(function (d) {
                select(this).classed(d.sig, true);
            });

        return labels;

    }

    function layout_links () {

        let links = mesh.selectAll('.link')
            .data(mesh => mesh.edges, function (edge) { return edge.id ? edge.id : this.id });

        links.exit()
            .remove();

        links = links
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('id', edge => edge.id)
            .merge(links);

        return links;

    }

    function layout_nodes () {

        let nodes = mesh.selectAll('.node')
            .data(mesh => mesh.nodes, function (node) { return node.id ? node.id : this.id });

        nodes.exit()
            .remove();

        nodes = nodes
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr('id', n => n.id)
            .merge(nodes)
            .each(function (d) {
                select(this).classed(d.sig, true);
            });

        return nodes;

    }

    function layout_node_labels () {

        let labels = mesh.selectAll('.nodelabel')
            .data(mesh => mesh.nodes, function (node) { return node.id ? node.id : this.id });

        labels.exit()
            .remove();

        labels = labels
            .enter()
            .append('text')
            .text(d => d.id.split('$').pop())
            .attr('class', 'label nodelabel')
            .attr('id', n => n.id)
            .attr('dy', '0.31em')
            .style('text-anchor', 'middle')
            .style('-webkit-user-select', 'none')
            .style('-moz-user-select', 'none')
            .style('-ms-user-select', 'none')
            .style('user-select', 'none')
            .merge(labels)
            .each(function (d) {
                select(this).classed(d.sig, true);
            });

        return labels;

    }

    function position_elements (elements) {

        elements
            .attr('points', d => d.nodes.reduce((acc, node) => acc + node.x + ',' + node.y + ' ', ''));

    }

    function position_element_labels (labels) {

        labels
            .attr('x', d => centroid_x(d.nodes))
            .attr('y', d => centroid_y(d.nodes));

    }

    function position_links (links) {

        let l = line()
            .x(d => d.x)
            .y(d => d.y);

        links
            .attr('d', edge => l(edge.nodes));

    }

    function position_nodes (nodes) {

        nodes
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);

    }

    function position_node_labels (labels) {

        labels
            .attr('x', d => d.x)
            .attr('y', d => d.y);

    }

    function reposition (width, height) {

    }

    function style_elements (elements) {
        elements
            .style('stroke', 'none')
            .style('fill', 'none');
    }

    function style_element_labels (labels) {

        labels
            .text(d => d.id.split('$').pop())
            .attr('dy', '0.31em')
            .style('font-family', 'sans-serif')
            .style('font-weight', 'bold')
            .style('text-anchor', 'middle')
            .style('-webkit-user-select', 'none')
            .style('-moz-user-select', 'none')
            .style('-ms-user-select', 'none')
            .style('user-select', 'none');

    }

    function style_links (links) {

        links
            .style('stroke', 'black');

    }

    function style_nodes (nodes) {

        nodes
            .style('stroke', 'black')
            .attr('r', 14);

    }

    function style_node_labels (labels) {

        labels
            .style('font-family', 'sans-serif')
            .style('font-weight', 'bold')
            .style('fill', 'white');

    }

    return view;

}