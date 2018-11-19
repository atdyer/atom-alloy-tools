'use babel';

import { select } from 'd3-selection';
import { view_style_value } from "./view-style-value";

export { style_value };

function style_value () {

    let values = {};

    let default_number = 20,
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
                selection.attr(property, get_number);
            } else {
                selection.style(property, get_number);
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
        if (!arguments.length) return default_number;
        default_number = +_;
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
        return 'number';
    };

    style.value = function (key, value) {
        if (arguments.length === 1) return values[key] || default_number;
        values[key] = value;
        return style;
    };

    style.view = function () {
        return view_style_value(style);
    };

    return style;

    function get_number (value) {
        if (!picker) return default_number;
        let key = picker.get(value.id);
        return key ? values[key] || default_number : default_number;
    }

}