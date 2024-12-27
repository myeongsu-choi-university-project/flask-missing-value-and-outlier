//히트맵 셀을 클릭했을 때 작동하는 핸들러 함수
function handleHeatmapCellClick(index) {
    var nanPercentage = nanHeatmapData[index];

    if (nanPercentage !== 0) {
        alert('이 인덱스에는 NaN 값이 포함되어 있어 라인 차트를 생성할 수 없습니다.');
        return;
    }

    d3.select('#line-chart svg').remove(); //기존 라인차트 제거

    //클릭된 히트맵 셀의 인덱스에 따라 데이터 범위 계산
    var startIndex = index * 10;
    var endIndex = startIndex + 10;
    var columnData = originalData.slice(startIndex, endIndex).map(d => {
        var value = d[selectedColumn];
        return value !== null ? +value : null;
    }); //originalData에서 해당 범위를 추출

    createLineChart(columnData, '#line-chart', selectedColumn, index);
}

//히트맵 생성 함수
function createHeatmap(data, selector, colorScheme, type) {
    //svg 설정
    var width = 300;
    var height = 300;
    var svg = d3.select(selector)
                .append('svg')
                .attr('width', width)
                .attr('height', height);

    var cellSize = width / 10;

    //d3를 사용하여 데이터 값을 색상으로 매핑하는 color scale 생성
    //d3의 interpolate 함수 중 하나를 동적으로 선택 (d3.interpolateBlues, d3.interpolateViridis...)
    var colorInterpolator = d3['interpolate' + colorScheme]; 
    //scaleSequential 함수는 단일 입력값 기준으로 연속적인 색상을 생성하는 scale 생성
    var colorScale = d3.scaleSequential(colorInterpolator)
                       .domain([0, 100]); //입력 값의 범위 정의

    //데이터 배열을 히트맵 셀에 필요한 형식 ({value, index})으로 변환
    var heatmapData = data.map(function(d, i) {
        return { value: d, index: i };
    });

    //각 데이터 포인트를 g 요소로 변환하여 셀 생성
    var cells = svg.selectAll('g')
                   .data(heatmapData)
                   .enter()
                   .append('g')
                   .attr('transform', function(d) {
                       var x = (d.index % 10) * cellSize;
                       var y = Math.floor(d.index / 10) * cellSize;
                       return 'translate(' + x + ',' + y + ')';
                   })
                   .style('cursor', 'pointer')
                   .on('click', function(event, d) {
                       if (type === 'nan' && d.value !== 0) {
                           alert('이 인덱스에는 NaN 값이 포함되어 있어 라인 차트를 생성할 수 없습니다.');
                           return;
                       }

                       if (type === 'outlier' && nanHeatmapData[d.index] !== 0) {
                           alert('이 인덱스에는 NaN 값이 포함되어 있어 라인 차트를 생성할 수 없습니다.');
                           return;
                       }

                       handleHeatmapCellClick(d.index);
                   });

    cells.append('rect')
         .attr('width', cellSize)
         .attr('height', cellSize)
         .attr('fill', function(d) { return colorScale(d.value); });

    cells.append('text')
         .attr('x', cellSize / 2)
         .attr('y', cellSize / 2)
         .attr('text-anchor', 'middle')
         .attr('dominant-baseline', 'central')
         .attr('font-size', '10px')
         .attr('fill', '#000')
         .text(function(d) { return d.value.toFixed(0) + '%'; });
}