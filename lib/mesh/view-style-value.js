'use babel';

import { select } from 'd3-selection';
import { collapse } from "./view-collapse";

export { view_style_value };

function view_style_value (styler) {

    let header,
        icon,
        title,
        value,
        body;

    let on_update,
        options;

    function view (selection) {

        [header, body] = collapse(selection);

        header.attr('class', 'row');

        icon = header.selectAll('.icon')
            .data(d => [d]);

        icon.exit()
            .remove();

        icon = icon
            .enter()
            .append('div')
            .attr('class', 'icon-button')
            .merge(icon)
            .on('click', toggle_body)
            .append('span')
            .attr('class', 'icon icon-plus');

        title = header.selectAll('.title')
            .data(d => [d]);

        title.exit()
            .remove();

        title = title
            .enter()
            .append('div')
            .attr('class', 'title')
            .merge(title)
            .text(styler.display_name());

        value = header.selectAll('.value')
            .data(d => [d]);

        value.exit()
            .remove();

        value = value
            .enter()
            .append('div')
            .attr('class', 'value')
            .merge(value);

        show_default();

    }

    view.on_update = function (cb) {
        if (!arguments.length) return on_update;
        on_update = cb;
        return view;
    };

    view.options = function (_) {
        if (!arguments.length) return options;
        options = _;
        return view;
    };

    return view;


    function show_default () {

        // Clear values in styler so that default is always used
        styler.clear();

        // Create selection
        let default_value = value.selectAll('.input-number')
            .data(d => [d]);

        default_value.exit()
            .remove();

        default_value = default_value
            .enter()
            .append('input')
            .attr('type', 'number')
            .attr('class', 'input-number')
            .merge(default_value);

        default_value
            .attr('value', styler.default())
            .on('input', function () {

                styler.default(+this.value);
                if (on_update) on_update();

            });

        // Hide the picker ID if one is visible
        hide_picker_id();

        // Show the default value if it already exists
        show_default_value();

        // Hide the body
        hide_body();

        // Set the body view to be the picker
        show_choose_picker();

        // Update
        if (on_update) on_update();

    }

    function show_choose_picker () {

        body.selectAll('*').remove();

        let pickers = body.selectAll('.picker-row')
            .data(d => d.pickers());

        pickers.enter()
            .append('div')
            .attr('class', 'picker-row')
            .on('click', function (d) {
                styler.pick(d);
                show_picker();
            })
            .each(function (d) {

                let picker = select(this);

                picker.append('div')
                    .attr('class', 'title')
                    .text(d.id());

                picker.append('div')
                    .attr('class', 'subtext')
                    .text(d.type() === 'dynamic' ? d.ordering().id : '');

            });


    }

    function show_picker () {

        // Hide the default value
        hide_default_value();

        // Show the picker ID in the header
        show_picker_id();


        body.selectAll('*').remove();

        let picker = body.selectAll('.picker')
            .data(d => [d.pick()]);

        picker = picker.enter()
            .append('div')
            .attr('class', 'picker')
            .merge(picker);

        // Select the ID in the header
        let id = value.selectAll('.pickerid')
            .data(picker.data());

        id.exit()
            .remove();

        id
            .enter()
            .append('div')
            .attr('class', 'pickerid')
            .merge(id)
            .text(d => d.id());

        // Select rows of the table
        let rows = picker.selectAll('.picker-row')
            .data(p => p.values());

        rows = rows
            .enter()
            .append('div')
            .attr('class', 'picker-row');

        // Select the first column
        let key = rows.selectAll('.title')
            .data(d => [d]);

        key
            .enter()
            .append('div')
            .attr('class', 'title')
            .text(d => d);

        // Select the second column
        let val = rows.selectAll('.input-number')
            .data(d => [d]);

        val
            .enter()
            .append('input')
            .attr('type', 'number')
            .attr('class', 'input-number')
            .attr('value', d => styler.value(d))
            .each(function (d) {

                styler.value(d, +this.value);

            })
            .on('input', function (d) {

                styler.value(d, +this.value);
                if (on_update) on_update();

            });

        // Add a row with option buttons
        let optsrow = picker.selectAll('.button-row')
            .data(d => [d]);

        optsrow = optsrow
            .enter()
            .append('div')
            .attr('class', 'button-row');

        let optbtns = optsrow.selectAll('.button-row-option')
            .data(['choose', 'default']);

        optbtns = optbtns
            .enter()
            .append('div')
            .attr('class', 'button-row-option');

        optbtns
            .text(d => d === 'choose' ? 'Choose Property' : 'Use Default')
            .on('click', d => {
                show_default();
                if (d === 'choose') toggle_body();
            });

        if (on_update) on_update();

    }



    function toggle_body () {

        body.style('display') === 'none' ? show_body() : hide_body();

    }

    function hide_body () {

        body.style('display', 'none');
        icon
            .classed('icon-dash', false)
            .classed('icon-plus', true);

    }

    function show_body () {

        body.style('display', null);
        icon
            .classed('icon-dash', true)
            .classed('icon-plus', false);

    }

    function hide_default_value () {

        value.selectAll('.input-number')
            .style('display', 'none');

    }

    function show_default_value () {

        value.selectAll('.input-number')
            .style('display', null);

    }

    function hide_picker_id () {

        value.selectAll('.pickerid')
            .style('display', 'none');

    }

    function show_picker_id () {

        value.selectAll('.pickerid')
            .style('display', null);

    }

}