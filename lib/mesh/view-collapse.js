'use babel';

export { collapse };

function collapse (selection, headertxt) {

    let header = selection.selectAll('.header')
        .data(d => [d]);

    header.exit()
        .remove();

    header = header
        .enter()
        .append('div')
        // .attr('class', 'header')
        .merge(header)
        .text(headertxt ? headertxt : null);

    let body = selection.selectAll('.body')
        .data(d => [d]);

    body.exit()
        .remove();

    body = body
        .enter()
        .append('div')
        // .attr('class', 'body')
        .merge(body);

    return [header, body];

}
