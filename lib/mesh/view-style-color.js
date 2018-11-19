'use babel';

import { select } from 'd3-selection';
import { schemeSet1 } from 'd3-scale-chromatic';
import { collapse } from "./view-collapse";

export { view_style_color };

function view_style_color (styler) {

    let color_options = schemeSet1.concat([
        '#000000',
        '#ffffff',
        'transparent'
    ]);

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

        // style_view(selection);
        // style_header(header);
        // style_icon(icon);
        // style_title(title);
        style_value(value);

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

        // Clear values in style so that default is always used
        styler.clear();

        value.each(function () {

            let container = select(this)
                .style('display', 'flex');

            let default_value = container
                .selectAll('.value')
                .data([styler.default()]);

            default_value.exit()
                .remove();

            default_value = default_value
                .enter()
                .append('div')
                .attr('class', 'value')
                .merge(default_value);

            default_value
                .each(style_color_box)
                .on('click', color_picker(container, color => {
                    styler.default(color);
                    show_default();
                }));

        });

        // Hide the picker ID if one is visible
        hide_picker_id();

        // Show the default value if it already exists
        show_default_value();

        // Hide the body
        hide_body();

        // Set the body view to the the picker
        show_choose_picker();

        // Update
        if (on_update) on_update();

    }

    function show_choose_picker () {

        // Hide the previously active picker
        hide_active_picker();

        // Show picker buttons
        show_picker_options();

        body.selectAll('.active')
            .style('display', 'none');

        let pickers = body.selectAll('.picker')
            .data(d => d.pickers());

        pickers.exit()
            .remove();

        pickers = pickers
            .enter()
            .append('div')
            .attr('class', 'picker picker-row')
            .merge(pickers);

        pickers
            .on('click', function (d) {
                styler.pick(d);
                show_picker();
            });

        pickers.each(function (d) {

            let picker = select(this);

            picker.selectAll('div')
                .remove();

            let id = picker
                .append('div')
                .attr('class', 'title')
                .text(d.id());

            let ordering = picker
                .append('div')
                .attr('class', 'subtext')
                .text(d.type() === 'dynamic' ? d.ordering().id : '');

            // style_header(picker);
            // style_key(id);
            // style_subtext(ordering);

        });

        // style_button(pickers);

    }

    function show_picker () {

        // Hide the default value
        hide_default_value();

        // Show the picker ID in the header
        show_picker_id();

        // Hide any picker buttons
        hide_picker_options();

        // Show the active picker
        show_active_picker();

        // Select the table
        let picker = body.selectAll('.active')
            .data(d => [d.pick()]);

        picker.exit()
            .remove();

        picker = picker
            .enter()
            .append('div')
            .attr('class', 'active body')
            .merge(picker);

        // Select the ID in the header
        let id = value.selectAll('.pickerid')
            .data(picker.data());

        id.exit()
            .remove();

        id = id
            .enter()
            .append('div')
            .attr('class', 'pickerid')
            .merge(id)
            .text(d => d.id());

        // Select rows of the table
        let rows = picker.selectAll('.row')
            .data(p => p.values());

        rows.exit()
            .remove();

        rows = rows
            .enter()
            .append('div')
            .attr('class', 'row')
            .merge(rows);

        rows.each(function (d) {

            let row = select(this);

            let key = row.selectAll('.title')
                .data([d]);

            key.exit()
                .remove();

            key = key
                .enter()
                .append('div')
                .attr('class', 'title')
                .merge(key)
                .text(d => d);

            // style_key(key);

            let val = row.selectAll('.value')
                .data(d => [styler.value(d)]);

            val.exit()
                .remove();

            val = val
                .enter()
                .append('div')
                .attr('class', 'value')
                .merge(val);

            val.each(style_color_box)
                .on('click', color_picker(row, color => {
                    styler.value(d, color);
                    if (on_update) on_update();
                    show_picker();
                }));

        });

        // Add a row with option buttons
        let optsrow = picker.selectAll('.button-row')
            .data(d => [d]);

        optsrow.exit()
            .remove();

        optsrow = optsrow
            .enter()
            .append('div')
            .attr('class', 'button-row')
            .merge(optsrow);

        let optbtns = optsrow.selectAll('.button-row-option')
            .data(['choose', 'default']);

        optbtns.exit()
            .remove();

        optbtns = optbtns
            .enter()
            .append('div')
            .attr('class', 'button-row-option')
            .merge(optbtns);

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

    function hide_active_picker () {

        body.selectAll('.active')
            .style('display', 'none');

    }

    function show_active_picker () {

        body.selectAll('.active')
            .style('display', null);

    }

    function hide_picker_options () {

        body.selectAll('.picker')
            .style('display', 'none');

    }

    function show_picker_options () {

        body.selectAll('.picker')
            .style('display', null);

    }

    function hide_default_value () {

        value.selectAll('.value')
            .style('display', 'none');

    }

    function show_default_value () {

        value.selectAll('.value')
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


    function color_picker (selection, callback) {

        return function () {

            let values = selection.selectAll('.value')
                .data(color_options);

            values.exit()
                .remove();

            values.enter()
                .append('div')
                .attr('class', 'value')
                .merge(values)
                .each(style_color_box)
                .on('click', callback);

        }

    }


    function style_view (selection) {

        selection
            .style('font-family', 'sans-serif')
            .style('font-size', '14px')
            .style('padding', '5px 5px 5px 0')
            .style('border-bottom', '1px solid white');

    }

    function style_header (selection) {

        selection
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('min-height', '30px');

    }

    function style_icon (selection) {

        selection
            .style('flex', '0 1 auto')
            .style('display', 'flex')
            .style('justify-content', 'center')
            .style('cursor', 'pointer')
            .style('margin-left', '-5px')
            .style('padding-right', '5px')
            .style('min-width', '1em');

    }

    function style_title (selection) {

        selection
            .style('flex', '1 0 auto');

    }

    function style_id (selection) {

        selection
            .style('flex', '0 1 auto')
            .style('text-align', 'right')
            .style('font-size', '14px')
            .style('font-weight', 'bold');

    }

    function style_value (selection) {

        selection
            .style('flex', '0 1 auto');

    }

    function style_button (selection) {

        selection
            .style('cursor', 'pointer')
            .style('padding', '5px 10px 5px 10px')
            .style('flex', '1 0 auto')
            .on('mouseover', on_hover)
            .on('mouseout', on_leave);

        function on_hover () {
            select(this)
                .style('background-color', 'rgba(0, 0, 0, 0.1)');
        }

        function on_leave () {
            select(this)
                .style('background-color', null);
        }

    }

    function style_option_button (selection) {

        style_button(selection);
        selection
            .style('margin', '10px 5px 10px 5px')
            .style('display', 'flex')
            .style('justify-content', 'center')
            .style('flex-direction', 'column')
            .style('text-align', 'center')
            .style('font-size', '10px')
            .style('border', '1px solid white');

    }

    function style_key (selection) {

        selection
            .style('flex', '1 0 auto')
            .style('font-size', '12px')
            .style('font-weight', 'bold');

    }

    function style_subtext (selection) {

        selection
            .style('font-size', '10px')
            .style('color', '#777');

    }

    function style_color_box (color) {
        let t = color === 'transparent';
        select(this)
            .classed('color-box', true)
            .classed('transparent-box', t)
            .style('background-color', color);
    }

}