function createTable(data) {
    //HTML의 테이블 tbody 선택
    var tbody = d3.select('#stats-table tbody');

    //데이터에 따라 테이블 행 생성
    var rows = tbody.selectAll('tr')
                    .data(data) //데이터 바인딩
                    .enter()
                    .append('tr')
                    .on('click', function(event, d) {
                        //행 클릭 이벤트 처리
                        selectedColumn = d.column;
                        updateVisualization();
                        document.getElementById("nanDropdown").innerText = '처리 방법 선택';
                        document.getElementById("outlierDropdown").innerText = '처리 방법 선택';
                    });

    //각 행에 대해 열 생성
    rows.selectAll('td')
        .data(function(row) {
            //각 행의 데이터 배열 생성 (열에 매핑될 값)
            return [
                row.column,
                row.nan_count,
                row.mean,
                row.std,
                row.outlier_count
            ];
        })
        .enter()
        .append('td')
        .text(function(d) { return d; }); //열에 텍스트값 삽입
}

function updateTable(data) {
    //선택된 테이블 행에 데이터를 바인딩
    var rows = d3.select('#stats-table tbody').selectAll('tr')
                 .data(data);

    //데이터가 없는 행을 제거
    rows.exit().remove();

    //새로운 행 생성 및 이벤트 추가
    var newRows = rows.enter() //새롭게 추가될 데이터 선택
                      .append('tr')
                      .on('click', function(event, d) {
                          selectedColumn = d.column;
                          updateVisualization();
                      });

    //기존 행과 새로운 행 병합 후 열 처리
    newRows.merge(rows) //기존 행과 새로운 행을 병합
           .selectAll('td')
           .data(function(row) { //데이터 바인딩
               return [
                   row.column,
                   row.nan_count,
                   row.mean,
                   row.std,
                   row.outlier_count
               ];
           })
           .join('td')
           .text(function(d) { return d; });
}