'use babel';

import { select } from 'd3-selection';
import { collapse } from "./view-collapse";

export { view_orderings };

function view_orderings (orderings, properties) {

    let on_update;

    function view (selection) {

        let container = selection.selectAll('.orderings')
            .data(['Orderings']);

        container.exit()
            .remove();

        container = container
            .enter()
            .append('div')
            .attr('class', 'orderings body')
            .attr('id', d => d)
            .merge(container);

        let [header, body] = collapse(container, 'Orderings');

        header.attr('class', 'header');

        let orders = body.selectAll('.ordering')
            .data(orderings);

        orders.exit()
            .remove();

        orders
            .enter()
            .append('div')
            .attr('class', 'ordering')
            .attr('id', d => d.id)
            .each(function (d) {

                let order = select(this);

                let id = order
                    .append('div')
                    .attr('class', 'id')
                    .text(d.id);

                let previous = order
                    .append('div')
                    .attr('class', 'icon-button')
                    .append('span')
                    .attr('class', 'icon icon-arrow-left');

                let selector = order
                    .append('select')
                    .attr('class', 'input-select')
                    .attr('required', true);

                let next = order
                    .append('span')
                    .attr('class', 'icon-button icon icon-arrow-right');

                let options = selector.selectAll('option')
                    .data(d.atoms);

                options
                    .enter()
                    .append('option')
                    .attr('value', d => d)
                    .text(d => d);

                previous.on('click', function () {
                    let options = selector.node().options;
                    let current = options.selectedIndex;
                    if (current > 0) {
                        options.selectedIndex -= 1;
                        on_change.call(selector.node());
                    }
                });

                selector
                    .on('change', on_change);

                next.on('click', function () {
                    let options = selector.node().options;
                    let current = options.selectedIndex;
                    if (current < options.length - 1) {
                        options.selectedIndex += 1;
                        on_change.call(selector.node());
                    }
                });

                function on_change () {
                    let value = this.options[this.options.selectedIndex].value;
                    properties.forEach(property => {
                        if (property.type() === 'dynamic' && property.ordering().id === d.id) {
                            property.order(value);
                        }
                    });
                    if (on_update) on_update();
                }

            });


    }

    view.on_change = function (callback) {

        if (!arguments.length) return on_update;
        on_update = callback;
        return view;

    };

    return view;

}