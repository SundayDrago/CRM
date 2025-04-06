from flask import Flask, request, jsonify
import pandas as pd
import joblib
import logging
from flask_cors import CORS
import numpy as np
from datetime import datetime, timedelta
import os

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)

# Configuration
MODEL_FILES = {
    'kmeans': 'kmeans_model.pkl',
    'scaler': 'scaler.pkl',
    'encoders': 'label_encoders.pkl'
}

CLUSTER_PROFILES = {
    0: {"description": "Young, Low-Income Occasional Shoppers",
        "traits": "Age 18-24, Income <450,000, Spends <50,000, Shops Rarely"},
    1: {"description": "Young, Moderate-Income Shoppers",
        "traits": "Age 18-24, Income 450,000-1,000,000, Spends 50,000-100,000, Shops Often"},
    2: {"description": "Middle-Aged High Spenders",
        "traits": "Age 25-34, Income >2,000,000, Spends 50,000-100,000, Convenience-Focused"},
    3: {"description": "Older Value-Seeking Shoppers",
        "traits": "Age 45-54, Income <450,000, Spends <50,000, Price-Driven"}
}

CATEGORICAL_COLS = [
    'Age', 'Gender', 'Monthly Income', 'Region', 'Frequency of Shopping(Regular)',
    'Average spending', 'Categories', 'Means of Payment',
    'Enrolled on Jumia Prime or any loyalty program', 'Frequency of shopping(Occassional)',
    'Reason for your purchase', 'Device to shop', 'Internet connection used',
    'Recommendation to others'
]

NUMERICAL_COLS = ['Rate of Satisfaction', 'Rate of availability of products']

# Directory where app.py and models are located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADED_DATA_PATH = os.path.join(BASE_DIR, 'uploaded_data.csv')

# Load ML artifacts
def load_artifacts():
    try:
        artifacts = {
            'kmeans': joblib.load(MODEL_FILES['kmeans']),
            'scaler': joblib.load(MODEL_FILES['scaler']),
            'encoders': joblib.load(MODEL_FILES['encoders'])
        }
        for col, encoder in artifacts['encoders'].items():
            if 'Unknown' not in encoder.classes_:
                encoder.classes_ = np.append(encoder.classes_, 'Unknown')
        return artifacts
    except FileNotFoundError as e:
        raise RuntimeError(f"Model loading failed: {str(e)}")

ml_artifacts = load_artifacts()

# Global data variables (initially None until a file is uploaded)
RAW_DATA = None
PREPROCESSED_DATA = None

# Load and preprocess dataset
def load_and_preprocess_data(filepath):
    try:
        data = pd.read_csv(filepath)
        data.columns = [col.strip() for col in data.columns]
        logging.info("Dataset loaded successfully")
        logging.info(f"Available columns in dataset: {list(data.columns)}")
        return data, preprocess_dataset(data)
    except Exception as e:
        logging.error(f"Error loading dataset: {str(e)}")
        return None, None

def preprocess_dataset(df):
    df_encoded = df.copy()

    expected_cols = {col.strip(): col for col in CATEGORICAL_COLS + NUMERICAL_COLS}
    df_encoded.columns = [expected_cols.get(col.strip(), col.strip()) for col in df_encoded.columns]

    for col in CATEGORICAL_COLS:
        if col in df_encoded.columns:
            df_encoded[col] = df_encoded[col].fillna('Unknown')

    available_categorical = [col for col in CATEGORICAL_COLS if col in df_encoded.columns]
    available_numerical = [col for col in NUMERICAL_COLS if col in df_encoded.columns]
    available_cols = available_categorical + available_numerical

    if not available_cols:
        raise ValueError("No valid columns available for preprocessing")

    all_required_cols = set(CATEGORICAL_COLS + NUMERICAL_COLS)
    missing_cols = all_required_cols - set(df_encoded.columns)
    if missing_cols:
        logging.warning(f"Missing columns: {missing_cols}. These will be padded with zeros.")

    for col in available_categorical:
        if col in ml_artifacts['encoders']:
            df_encoded[col] = ml_artifacts['encoders'][col].transform(df_encoded[col])

    X = df_encoded[available_cols].copy()
    for col in (CATEGORICAL_COLS + NUMERICAL_COLS):
        if col not in X.columns:
            X[col] = 0
    X = X[CATEGORICAL_COLS + NUMERICAL_COLS]

    X_scaled = ml_artifacts['scaler'].transform(X)
    clusters = ml_artifacts['kmeans'].predict(X_scaled)
    df_encoded['Cluster'] = clusters

    return df_encoded

# Initial load (optional, only if System Data.csv exists)
try:
    RAW_DATA, PREPROCESSED_DATA = load_and_preprocess_data('System Data.csv')
except FileNotFoundError:
    logging.warning("No initial System Data.csv found. Waiting for upload.")

def validate_input(data):
    for col in NUMERICAL_COLS:
        if col in data and (not isinstance(data[col], (int, float)) or data[col] < 0 or data[col] > 5):
            return False, f"Invalid {col}: must be a number between 0 and 5"
    return True, None

@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Customer Segmentation API',
                    'endpoints': ['/upload', '/segments', '/segment', '/dashboard', '/query', '/segments/<id>']})

@app.route('/upload', methods=['POST'])
def upload_dataset():
    global RAW_DATA, PREPROCESSED_DATA  # Declare globals at the start
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in request'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        file.save(UPLOADED_DATA_PATH)
        RAW_DATA, PREPROCESSED_DATA = load_and_preprocess_data(UPLOADED_DATA_PATH)
        if RAW_DATA is None or PREPROCESSED_DATA is None:
            return jsonify({'error': 'Failed to process uploaded dataset'}), 500

        return jsonify({'message': 'Dataset uploaded and processed successfully', 'path': UPLOADED_DATA_PATH}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/segments', methods=['GET'])
def get_segments():
    try:
        if PREPROCESSED_DATA is None:
            return jsonify({'error': 'No dataset uploaded yet. Please upload a dataset first.'}), 400

        cluster_counts = PREPROCESSED_DATA['Cluster'].value_counts().to_dict()
        segments = [
            {"id": 1, "name": "Cluster 0", "count": cluster_counts.get(0, 0), "criteria": CLUSTER_PROFILES[0]["traits"], "source": "Model"},
            {"id": 2, "name": "Cluster 1", "count": cluster_counts.get(1, 0), "criteria": CLUSTER_PROFILES[1]["traits"], "source": "Model"},
            {"id": 3, "name": "Cluster 2", "count": cluster_counts.get(2, 0), "criteria": CLUSTER_PROFILES[2]["traits"], "source": "Model"},
            {"id": 4, "name": "Cluster 3", "count": cluster_counts.get(3, 0), "criteria": CLUSTER_PROFILES[3]["traits"], "source": "Model"}
        ]
        return jsonify(segments)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/segments/<int:segment_id>', methods=['PUT'])
def update_segment(segment_id):
    global PREPROCESSED_DATA, RAW_DATA  # Declare globals at the start
    try:
        if PREPROCESSED_DATA is None or RAW_DATA is None:
            return jsonify({'error': 'No dataset uploaded yet. Please upload a dataset first.'}), 400

        data = request.get_json()
        if not data or 'criteria' not in data:
            return jsonify({'error': 'Criteria field is required'}), 400

        new_criteria = data['criteria']
        cluster_id = segment_id - 1  # Map segment_id (1-4) to cluster_id (0-3)
        if cluster_id not in CLUSTER_PROFILES:
            return jsonify({'error': f"Invalid segment ID: {segment_id}"}), 404

        # Update the CLUSTER_PROFILES with new criteria
        CLUSTER_PROFILES[cluster_id]["traits"] = new_criteria

        # Re-cluster based on new criteria
        filtered_data = filter_data_by_criteria(RAW_DATA.copy(), new_criteria, cluster_id)
        PREPROCESSED_DATA = preprocess_dataset(filtered_data)

        # Recalculate cluster counts
        cluster_counts = PREPROCESSED_DATA['Cluster'].value_counts().to_dict()
        updated_segment = {
            "id": segment_id,
            "name": f"Cluster {cluster_id}",
            "count": cluster_counts.get(cluster_id, 0),
            "criteria": new_criteria,
            "source": "Model"
        }

        return jsonify(updated_segment), 200
    except Exception as e:
        logging.error(f"Error updating segment: {str(e)}")
        return jsonify({'error': str(e)}), 500

def filter_data_by_criteria(data, criteria, cluster_id):
    """
    Filter the dataset based on the new criteria and retain the original cluster assignment.
    This is a simple implementation; adjust based on your actual criteria format and needs.
    """
    try:
        # Example criteria parsing (assumes criteria like "Age 18-24, Income <450,000")
        conditions = []
        for part in criteria.split(','):
            part = part.strip()
            if 'Age' in part:
                age_range = part.split('Age')[-1].strip()
                if '-' in age_range:
                    low, high = map(int, age_range.split('-'))
                    conditions.append((data['Age'].str.match(f"^{low}-{high}$", na=False)))
            elif 'Income' in part:
                if '<' in part:
                    threshold = int(part.split('<')[-1].replace(',', '').strip())
                    conditions.append((data['Monthly Income'].str.replace(',', '').astype(float) < threshold))
                elif '>' in part:
                    threshold = int(part.split('>')[-1].replace(',', '').strip())
                    conditions.append((data['Monthly Income'].str.replace(',', '').astype(float) > threshold))
            elif 'Spends' in part:
                if '<' in part:
                    threshold = int(part.split('<')[-1].replace(',', '').strip())
                    conditions.append((data['Average spending'].str.replace(',', '').astype(float) < threshold))
                elif '>' in part:
                    threshold = int(part.split('>')[-1].replace(',', '').strip())
                    conditions.append((data['Average spending'].str.replace(',', '').astype(float) > threshold))

        # Combine conditions with AND logic
        if conditions:
            final_condition = conditions[0]
            for cond in conditions[1:]:
                final_condition = final_condition & cond
            filtered_data = data[final_condition]
        else:
            filtered_data = data  # If no valid conditions, return original data

        return filtered_data
    except Exception as e:
        logging.error(f"Error filtering data: {str(e)}")
        raise

@app.route('/segment', methods=['POST'])
def segment_customer():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400

        valid, error = validate_input(data if not isinstance(data, list) else data[0])
        if not valid:
            return jsonify({'error': error}), 400

        new_customers = pd.DataFrame(data if isinstance(data, list) else [data])
        results = []
        for idx, customer in new_customers.iterrows():
            for col in CATEGORICAL_COLS:
                if col not in customer or pd.isna(customer[col]):
                    new_customers.at[idx, col] = 'Unknown'
                else:
                    try:
                        new_customers.at[idx, col] = ml_artifacts['encoders'][col].transform([customer[col]])[0]
                    except ValueError:
                        new_customers.at[idx, col] = ml_artifacts['encoders'][col].transform(['Unknown'])[0]

            available_cols = [col for col in (CATEGORICAL_COLS + NUMERICAL_COLS) if col in new_customers.columns]
            X_new = new_customers.loc[[idx], available_cols]
            for col in (CATEGORICAL_COLS + NUMERICAL_COLS):
                if col not in X_new.columns:
                    X_new[col] = 0
            X_new = X_new[CATEGORICAL_COLS + NUMERICAL_COLS]

            X_new_scaled = ml_artifacts['scaler'].transform(X_new)
            cluster = ml_artifacts['kmeans'].predict(X_new_scaled)[0]
            results.append({
                'cluster': int(cluster),
                'description': CLUSTER_PROFILES[cluster]["description"],
                'traits': CLUSTER_PROFILES[cluster]["traits"],
                'status': 'success'
            })

        return jsonify(results if isinstance(data, list) else results[0])
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 400

@app.route('/dashboard', methods=['GET'])
def get_dashboard_data():
    try:
        if PREPROCESSED_DATA is None:
            return jsonify({'error': 'No dataset uploaded yet. Please upload a dataset first.'}), 400

        cluster_counts = PREPROCESSED_DATA['Cluster'].value_counts().to_dict()
        total_customers = len(PREPROCESSED_DATA)

        key_metrics = [
            {"id": 1, "title": "Predicted Revenue", "value": f"UGX {int(total_customers * 1000):,}", "trend": 8.2, "confidence": 94, "shortDescription": "Expected revenue based on customer segments"},
            {"id": 2, "title": "Churn Risk", "value": f"{(cluster_counts.get(3, 0) / total_customers * 100):.1f}%", "trend": -1.2, "confidence": 89, "shortDescription": "Percentage of 'At Risk' customers"},
            {"id": 3, "title": "Customer Lifetime Value", "value": "UGX 2,450", "trend": 5.5, "confidence": 91, "shortDescription": "Average CLV across segments"}
        ]

        feature_importance = [
            {"name": "Frequency of Shopping(Regular)", "importance": 92},
            {"name": "Average spending", "importance": 87},
            {"name": "Rate of Satisfaction", "importance": 78}
        ]

        recommendations = [
            {"priority": "High", "title": "Target At-Risk Customers", "description": f"Engage {cluster_counts.get(3, 0)} customers in cluster 3 with promotions", "impact": "UGX 28,000 revenue preservation", "confidence": 88},
            {"priority": "Medium", "title": "Upsell High Spenders", "description": f"Target {cluster_counts.get(2, 0)} customers in cluster 2", "impact": "UGX 12,000 revenue increase", "confidence": 76}
        ]

        customer_predictions = []
        spending_map = {'<50,000': 500, '50,000-100,000': 1500, '100,000-200,000': 3000, '>200,000': 5000}
        sample_data = PREPROCESSED_DATA.sample(min(10, len(PREPROCESSED_DATA)))
        for idx, row in sample_data.iterrows():
            cluster = row['Cluster']
            predicted_value = spending_map.get(row.get('Average spending', '<50,000'), 1000)
            churn_risk = 50 if cluster == 3 else (20 if cluster == 0 else 10)
            next_purchase = (datetime.now() + timedelta(days=np.random.randint(5, 30))).strftime('%Y-%m-%d')
            name = row.get('CustomerName', f"Customer {idx + 1}")
            customer_predictions.append({
                "id": int(idx + 1000),
                "name": name,
                "segment": CLUSTER_PROFILES[cluster]['description'],
                "churnRisk": churn_risk,
                "predictedValue": predicted_value,
                "nextPurchase": next_purchase
            })

        chart_data = {
            "segments": {
                "labels": [CLUSTER_PROFILES[i]["description"] for i in range(4)],
                "data": [cluster_counts.get(i, 0) for i in range(4)],
                "colors": ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2"]
            },
            "spending": {
                "labels": ["Jan", "Feb", "Mar"],
                "data": [85000, 92000, 105000],
                "color": "#4e79a7"
            },
            "churn": {
                "labels": ["Low (<20%)", "Medium (20-50%)", "High (>50%)"],
                "data": [len(sample_data[sample_data['Cluster'] != 3]), len(sample_data[sample_data['Cluster'] == 0]), len(sample_data[sample_data['Cluster'] == 3])],
                "colors": ["#59a14f", "#f28e2b", "#e15759"]
            }
        }

        return jsonify({
            "keyMetrics": key_metrics,
            "featureImportance": feature_importance,
            "recommendations": recommendations,
            "customerPredictions": customer_predictions,
            "chartData": chart_data
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/query', methods=['GET'])
def query_data():
    try:
        if RAW_DATA is None:
            return jsonify({'error': 'No dataset uploaded yet. Please upload a dataset first.'}), 400

        filters = {
            'Age': request.args.get('age'),
            'Gender': request.args.get('gender'),
            'Region': request.args.get('region'),
            'Average spending': request.args.get('spending')
        }

        filtered_data = RAW_DATA.copy()

        active_filters = {k: v for k, v in filters.items() if v}
        for key, value in active_filters.items():
            if key in filtered_data.columns:
                filtered_data = filtered_data[filtered_data[key] == value]
            else:
                logging.warning(f"Filter column {key} not found in dataset")
                return jsonify({'error': f"Invalid filter: {key} not found"}), 400

        total = len(filtered_data)

        counts = {}
        if len(active_filters) == 0:
            counts = {"total": total}
        elif len(active_filters) == 1:
            key = list(active_filters.keys())[0]
            counts[key] = filtered_data[key].value_counts().to_dict()
        else:
            counts = {"total": total}

        return jsonify({
            "counts": counts,
            "total": total
        })
    except Exception as e:
        logging.error(f"Error in query_data: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)