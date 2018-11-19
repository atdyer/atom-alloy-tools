'use babel';

export {
    property_static,
    property_dynamic
}

function property_static (id, signature) {

    let data = {};

    function property () {

    }

    property.atoms = function () {
        return Object.keys(data);
    };

    property.get = function (atom) {
        return data[atom];
    };

    property.id = function () {
        return id;
    };

    property.set = function (atom, value) {
        data[atom] = value;
    };

    property.signature = function () {
        return signature;
    };

    property.type = function () {
        return 'static';
    };

    property.values = function () {
        return Array.from(new Set(Object.values(data)));
    };

    return property;

}

function property_dynamic (id, signature) {

    let data = {},
        order,
        ordering;

    function property () {

    }

    property.atoms = function () {
        return Object.keys(data);
    };

    property.get = function (atom, time) {
        if (arguments.length === 1 && !order) return data[atom];
        time = time || order;
        let datum = data[atom] ? data[atom].find(ts => ts[1] === time) : null;
        if (datum) return datum[0];
    };

    property.id = function () {
        return id;
    };

    property.order = function (_) {
        if (!arguments.length) return order;
        if (ordering && ordering.atoms.includes(_)) order = _;
        return property;
    };

    property.ordering = function (_) {
        if (!arguments.length) return ordering;
        ordering = _;
        order = ordering.atoms[0];
        return property;
    };

    property.orders = function () {
        let tables = Object.values(data);
        let values = tables.map(table => table.reduce((acc, row) => acc.concat(row[1]), []));
        let valset = new Set(values.reduce((acc, cur) => acc.concat(cur), []));
        return Array.from(valset);
    };

    property.set = function (atom, table) {
        data[atom] = table;
    };

    property.signature = function () {
        return signature;
    };

    property.type = function () {
        return 'dynamic';
    };

    property.values = function () {
        let tables = Object.values(data);
        let values = tables.map(table => table.reduce((acc, row) => acc.concat(row[0]), []));
        let valset = new Set(values.reduce((acc, cur) => acc.concat(cur), []));
        return Array.from(valset);
    };

    return property;
}