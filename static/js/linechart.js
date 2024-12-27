function createLineChart(data, selector, column, index) {
   var margin = {top: 50, right: 30, bottom: 50, left: 60},
       width = 800 - margin.left - margin.right,
       height = 400 - margin.top - margin.bottom;

   var svg = d3.select(selector)
               .append('svg')
               .attr('width', width + margin.left + margin.right)
               .attr('height', height + margin.top + margin.bottom)
               .append('g')
               .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

   var x = d3.scaleLinear()
             .domain([0, data.length - 1])
             .range([0, width]);

   var y = d3.scaleLinear()
             .domain(d3.extent(data.filter(d => d !== null)))
             .range([height, 0]);

   svg.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x));

   svg.append('g')
      .call(d3.axisLeft(y));

   var line = d3.line()
                .defined(d => d !== null)
                .x(function(d, i) { return x(i); })
                .y(function(d) { return y(d); });

   svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#007BFF')
      .attr('stroke-width', 2)
      .attr('d', line);

   svg.selectAll('circle')
      .data(data)
      .enter()
      .filter(d => d !== null)
      .append('circle')
      .attr('cx', function(d, i) { return x(i); })
      .attr('cy', function(d) { return y(d); })
      .attr('r', 4)
      .attr('fill', '#007BFF');

   svg.append('text')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .text(column + ' - 인덱스 ' + index);
}