'use babel';

import { select } from 'd3-selection';
import { nest } from 'd3-collection';
import { collapse } from "./view-collapse";

export { view_styles };

function view_styles (styles, properties) {

    let signatures = group_styles_and_properties(styles, properties);
    let on_update;

    function view (selection) {

        let sig = selection.selectAll('.signature')
            .data(signatures);

        sig.exit()
            .remove();

        sig = sig
            .enter()
            .append('div')
            .attr('class', 'signature body')
            .attr('id', s => s.key)
            .merge(sig);

        [header, sig] = collapse(sig, s => s.key);

        header.attr('class', 'header');

        let style = sig.selectAll('.style')
            .data(s => s.values);

        style.exit()
            .remove();

        style = style
            .enter()
            .append('div')
            .attr('class', 'style')
            .merge(style);

        style.each(function (d) {
            let view = d.view();
            if (on_update) view.on_update(on_update);
            view(select(this));
        });

    }

    view.on_update = function (callback) {
        if (!arguments.length) return on_update;
        on_update = callback;
        return view;
    };

    return view;

    function group_styles_and_properties (styles, properties) {

        let s = nest()
            .key(s => s.class())
            .entries(styles);

        s.forEach(signature => {
            signature.values.forEach(style => {
                style.pickers(properties.filter(p => p.signature() === style.class()));
            });
        });

        return s;

    }

}