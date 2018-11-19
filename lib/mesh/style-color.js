'use babel';

import { select } from 'd3-selection';

import { view_style_color } from "./view-style-color";

export {
    style_color
};

function style_color () {

    let values = {};

    let default_color = 'black',
        picker,
        pickers;

    let attr = false,
        label = false,
        clss,
        property;

    let name;

    function style (selection) {

        if (property) {

            selection = selection.filter(function () {
                return select(this).classed('label') === label;
            });

            if (clss) {
                selection = selection.filter(function () {
                    return select(this).classed(clss);
                });
            }

            if (picker) {
                selection = selection.filter(function (d) {
                    return picker.atoms().includes(d.id);
                });
            }

            if (attr) {
                selection.attr(property, get_color);
            } else {
                selection.style(property, get_color);
            }

        }

    }

    style.attr = function (_) {
        if (!arguments.length) return attr;
        attr = !!_;
        return style;
    };

    style.class = function (_) {
        if (!arguments.length) return clss;
        clss = _;
        return style;
    };

    style.clear = function () {
        values = {};
        return style;
    };

    style.default = function (_) {
        if (!arguments.length) return default_color;
        default_color = _;
        return style;
    };

    style.display_name = function (_) {
        if (!arguments.length) return name ? name : property;
        name = '' + _;
        return style;
    };

    style.label = function (_) {
        if (!arguments.length) return label;
        label = !!_;
        return style;
    };

    style.pick = function (_) {
        if (!arguments.length) return picker;
        picker = _;
        return style;
    };

    style.pickers = function (_) {
        if (!arguments.length) return pickers;
        pickers = _;
        return style;
    };

    style.property = function (_) {
        if (!arguments.length) return property;
        property = _;
        return style;
    };

    style.type = function () {
        return 'color';
    };

    style.value = function (key, value) {
        if (arguments.length === 1) return values[key] || default_color;
        values[key] = value;
        return style;
    };

    style.view = function () {
        return view_style_color(style);
    };

    return style;

    function get_color (value) {
        if (!picker) return default_color;
        let key = picker.get(value.id);
        return key ? values[key] || default_color : default_color;
    }

}