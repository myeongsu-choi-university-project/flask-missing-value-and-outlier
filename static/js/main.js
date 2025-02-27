var originalData;
var tableData;
var selectedColumn;
var nanHeatmapData = [];

//d3.json으로 엔드포인트에서 json 데이터를 받아와서 처리
d3.json('/api/full_data').then(function(response) {
    originalData = response.data;
    var columns = response.columns;

    tableData = calculateStats(originalData, columns);
    createTable(tableData);
});

function visualizeData(data) {
    //heatmap이나 line chart가 이미 존재한다면 제거 후 다시 그림
    d3.select('#nan-heatmap svg').remove();
    d3.select('#outlier-heatmap svg').remove();
    d3.select('#line-chart svg').remove();

    createHeatmap(data.nan_heatmap, '#nan-heatmap', 'Reds', 'nan');
    createHeatmap(data.outlier_heatmap, '#outlier-heatmap', 'Blues', 'outlier');
}

//데이터에서 nan 개수, 평균, 표준편차, 이상치 개수를 계산하는 함수
function calculateStats(data, columns) {
    var stats = [];

    //column list의 각 column에 대해 반복
    columns.forEach(function(col) {
        var colData = data.map(d => {
            var value = d[col]; //data 배열의 col값을 가져옴
            return value !== null ? +value : null; //colData의 value라는 key에 저장
        });

         //null값이 포함되면 평균, 표쥰편차, outlier 계산이 어려우므로 유효한 데이터만 필터링
        var validData = colData.filter(d => d !== null);

        var nan_count = colData.filter(d => d === null).length; //nan 개수 계산
        var mean = d3.mean(validData); //평균값 계산
        var std = d3.deviation(validData); //표준편차 계산

        //이상치 개수 계산 코드
        var outlier_count = validData.filter(function(d) {
            var zScore = (d - mean) / std;
            return Math.abs(zScore) > 3; //zScore의 절대값이 3보다 크면 이상치로 판단
        }).length;

        //stats 배열에 추가
        stats.push({
            'column': col,
            'nan_count': nan_count,
            'mean': mean ? mean.toFixed(2) : 'N/A', //toFixed 함수는 소수점아래 두자리수까지 출력 (반환값 = 문자열)
            'std': std ? std.toFixed(2) : 'N/A',
            'outlier_count': outlier_count
        });
    });

    return stats;
}

function processData(type, method) {
    var columnData = originalData.map(d => {
        var value = d[selectedColumn];
        return value !== null ? +value : null;
    });

    var validData = columnData.filter(d => d !== null);

    //nan 및 이상치 값을 평균값으로 대체할지, 중앙값으로 대체할지 결정
    var replacementValue = method === 'mean' ? d3.mean(validData) : d3.median(validData);

    if (type === 'nan') {
        originalData.forEach(function(d, i) {
            if (d[selectedColumn] === null) { //nan이면 대체
                d[selectedColumn] = replacementValue;
            }
        });
        document.getElementById("nanDropdown").innerText = method === 'mean' ? '평균' : '중앙값';
    } else if (type === 'outlier') {
        var globalMean = d3.mean(validData);
        var globalStd = d3.deviation(validData);

        originalData.forEach(function(d, i) {
            var value = d[selectedColumn];
            if (value !== null) {
                var zScore = (value - globalMean) / globalStd;
                if (Math.abs(zScore) > 3) {
                    d[selectedColumn] = replacementValue; //이상치면 대체
                }
            }
        });
        document.getElementById("outlierDropdown").innerText = method === 'mean' ? '평균' : '중앙값';
    }

    updateVisualization();
}

//값이 업데이트 될 때마다 데이터 계산 후 시각화를 업데이트하는 함수
function updateVisualization() {
    var columnData = originalData.map(d => {
        var value = d[selectedColumn];
        return value !== null ? +value : null;
    });

    //nan, 이상치 값에 대해 처리가 완료된 후 이므로 재계산
    var validData = columnData.filter(d => d !== null);
    var globalMean = d3.mean(validData);
    var globalStd = d3.deviation(validData);

    var outlierFlags = columnData.map(d => {
        if (d === null) {
            return false;
        } else {
            var zScore = (d - globalMean) / globalStd;
            return Math.abs(zScore) > 3;
        }
    });

    var nan_heatmap = [];
    var outlier_heatmap = [];

    //전체 데이터 개수는 1000개인데, 히트맵은 10x10=100개이므로 각 cell마다 10개의 데이터에 대한 퍼센트값 출력
    for (var i = 0; i < columnData.length; i += 10) {
        var chunk = columnData.slice(i, i + 10); //각 cell에 대한 데이터 단위
        var nan_count = chunk.filter(d => d === null).length;
        var outlier_count = outlierFlags.slice(i, i + 10).filter(flag => flag).length;

        nan_heatmap.push((nan_count / 10) * 100);
        outlier_heatmap.push((outlier_count / 10) * 100);
    }

    nanHeatmapData = nan_heatmap;

    visualizeData({
        'nan_heatmap': nan_heatmap,
        'outlier_heatmap': outlier_heatmap
    });

    updateTable(calculateStats(originalData, Object.keys(originalData[0])));
}
