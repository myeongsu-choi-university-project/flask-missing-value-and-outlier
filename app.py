from flask import Flask, render_template
import pandas as pd     # csv data 읽어오기 위한 패키지
import numpy as np      # nan 체크를 위한 패키지
import json
import os

app = Flask(__name__)

# Data load
def load_data():
    base_dir = os.path.dirname(os.path.abspath(__file__))   # app.py의 절대 경로 추출
    csv_path = os.path.join(base_dir, 'static', 'data', 'health_data.csv')
    return pd.read_csv(csv_path)

data = load_data()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/full_data')
def get_full_data():
    # nan 값을 json으로 전달할 수 없기 때문에 None으로 변경
    data_dict = data.replace({np.nan: None}).to_dict(orient='records')
    response = {
        'data': data_dict,
        'columns': list(data.columns)
    }

    # json 형태로 return
    return app.response_class(
        response=json.dumps(response),
        status=200,
        mimetype='application/json' # 응답 데이터가 json임을 명시시
    )

if __name__ == '__main__':
    app.run(debug=True)