from flask import Flask, request, jsonify, send_file
import pandas as pd
import joblib
import logging
from flask_cors import CORS
import numpy as np
from datetime import datetime, timedelta
import os
import json
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table
from reportlab.lib.styles import getSampleStyleSheet

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
    0: {"description": "Young, Low-Income Occasional Shoppers", "traits": "Age 18-24, Income <450,000, Spends <50,000, Shops Rarely"},
    1: {"description": "Young, Moderate-Income Shoppers", "traits": "Age 18-24, Income 450,000-1,000,000, Spends 50,000-100,000, Shops Often"},
    2: {"description": "Middle-Aged High Spenders", "traits": "Age 25-34, Income >2,000,000, Spends 50,000-100,000, Convenience-Focused"},
    3: {"description": "Older Value-Seeking Shoppers", "traits": "Age 45-54, Income <450,000, Spends <50,000, Price-Driven"}
}

CATEGORICAL_COLS = [
    'Age', 'Gender', 'Monthly Income', 'Region', 'Frequency of Shopping(Regular)',
    'Average spending', 'Categories', 'Means of Payment',
    'Enrolled on Jumia Prime or any loyalty program', 'Frequency of shopping(Occassional)',
    'Reason for your purchase', 'Device to shop', 'Internet connection used',
    'Recommendation to others'
]

NUMERICAL_COLS = ['Rate of Satisfaction', 'Rate of availability of products']

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADED_DATA_PATH = os.path.join(BASE_DIR, 'uploaded_data.csv')
CUSTOMERS_FILE = os.path.join(BASE_DIR, 'customers.json')
SEGMENTS_FILE = os.path.join(BASE_DIR, 'segments.json')
REPORTS_DIR = os.path.join(BASE_DIR, 'reports')
STATIC_IMG_DIR = os.path.join(BASE_DIR, 'static', 'img')

for directory in [REPORTS_DIR, STATIC_IMG_DIR]:
    if not os.path.exists(directory):
        os.makedirs(directory)

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
    available_cols = [col for col in (CATEGORICAL_COLS + NUMERICAL_COLS) if col in df_encoded.columns]
    if not available_cols:
        raise ValueError("No valid columns available for preprocessing")
    for col in available_cols:
        if col in CATEGORICAL_COLS and col in ml_artifacts['encoders']:
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

try:
    RAW_DATA, PREPROCESSED_DATA = load_and_preprocess_data('System Data.csv')
except FileNotFoundError:
    logging.warning("No initial System Data.csv found. Waiting for upload.")

def validate_input(data):
    for col in NUMERICAL_COLS:
        if col in data and (not isinstance(data[col], (int, float)) or data[col] < 0 or data[col] > 5):
            return False, f"Invalid {col}: must be a number between 0 and 5"
    return True, None

def read_customers():
    try:
        with open(CUSTOMERS_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def write_customers(customers):
    with open(CUSTOMERS_FILE, 'w') as f:
        json.dump(customers, f, indent=2)

def read_segments():
    try:
        with open(SEGMENTS_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def write_segments(segments):
    with open(SEGMENTS_FILE, 'w') as f:
        json.dump(segments, f, indent=2)

REPORTS = []
IMPLEMENTED_RECOMMENDATIONS = set()

# Routes
@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Customer Segmentation API',
                    'endpoints': ['/upload', '/segments', '/segments/model', '/segment', '/dashboard', '/query', '/reports', '/reports/generate', '/implement-recommendation']})

@app.route('/upload', methods=['POST'])
def upload_dataset():
    global RAW_DATA, PREPROCESSED_DATA
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
        model_segments = [
            {"id": i+1, "name": f"Cluster {i}", "count": cluster_counts.get(i, 0), "criteria": CLUSTER_PROFILES[i]["traits"], "source": "Model"}
            for i in range(4)
        ]
        custom_segments = read_segments()
        for segment in custom_segments:
            filtered_data = filter_data_by_criteria(RAW_DATA.copy(), segment['criteria'], None)
            segment['count'] = len(filtered_data)
            segment['source'] = "Custom"
        return jsonify(model_segments + custom_segments)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/segments/model', methods=['GET'])
def get_model_segments():
    try:
        if PREPROCESSED_DATA is None:
            return jsonify({'error': 'No dataset uploaded yet. Please upload a dataset first.'}), 400
        cluster_counts = PREPROCESSED_DATA['Cluster'].value_counts().to_dict()
        model_segments = [
            {"id": i+1, "name": f"Cluster {i}", "count": cluster_counts.get(i, 0), "criteria": CLUSTER_PROFILES[i]["traits"], "source": "Model"}
            for i in range(4)
        ]
        return jsonify(model_segments)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/segments/<int:segment_id>', methods=['PUT'])
def update_segment(segment_id):
    global PREPROCESSED_DATA, RAW_DATA
    try:
        if PREPROCESSED_DATA is None or RAW_DATA is None:
            return jsonify({'error': 'No dataset uploaded yet.'}), 400
        data = request.get_json()
        if not data or 'criteria' not in data:
            return jsonify({'error': 'Criteria field is required'}), 400
        new_criteria = data['criteria']

        if segment_id <= 4:  # Model segment
            cluster_id = segment_id - 1
            if cluster_id not in CLUSTER_PROFILES:
                return jsonify({'error': f"Invalid segment ID: {segment_id}"}), 404
            CLUSTER_PROFILES[cluster_id]["traits"] = new_criteria
            filtered_data = filter_data_by_criteria(RAW_DATA.copy(), new_criteria, cluster_id)
            PREPROCESSED_DATA = preprocess_dataset(filtered_data)
            cluster_counts = PREPROCESSED_DATA['Cluster'].value_counts().to_dict()
            updated_segment = {
                "id": segment_id,
                "name": f"Cluster {cluster_id}",
                "count": cluster_counts.get(cluster_id, 0),
                "criteria": new_criteria,
                "source": "Model"
            }
        else:  # Custom segment
            segments = read_segments()
            segment = next((s for s in segments if s['id'] == segment_id), None)
            if not segment:
                return jsonify({'error': f"Segment ID {segment_id} not found"}), 404
            segment['criteria'] = new_criteria
            filtered_data = filter_data_by_criteria(RAW_DATA.copy(), new_criteria, None)
            segment['count'] = len(filtered_data)
            write_segments(segments)
            updated_segment = segment

        return jsonify(updated_segment), 200
    except Exception as e:
        logging.error(f"Error updating segment: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/segments/<int:segment_id>', methods=['DELETE'])
def delete_segment(segment_id):
    try:
        if segment_id <= 4:
            return jsonify({'error': 'Cannot delete model-defined segments'}), 403
        segments = read_segments()
        segment = next((s for s in segments if s['id'] == segment_id), None)
        if not segment:
            return jsonify({'error': f"Segment ID {segment_id} not found"}), 404
        segments = [s for s in segments if s['id'] != segment_id]
        write_segments(segments)
        return jsonify({'message': f"Segment {segment_id} deleted"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def filter_data_by_criteria(data, criteria, cluster_id=None):
    try:
        conditions = []
        for part in criteria.split(','):
            part = part.strip()
            if 'Age' in part:
                age_range = part.split('Age')[-1].strip()
                if '-' in age_range:
                    low, high = map(int, age_range.split('-'))
                    conditions.append((data['Age'].str.match(f"^{low}-{high}$", na=False)))
            elif 'Gender' in part:
                gender = part.split('Gender')[-1].strip()
                conditions.append((data['Gender'] == gender))
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
            elif 'Frequency of Shopping(Regular)' in part:
                freq = part.split('Frequency of Shopping(Regular)')[-1].strip()
                conditions.append((data['Frequency of Shopping(Regular)'] == freq))
        if conditions:
            final_condition = conditions[0]
            for cond in conditions[1:]:
                final_condition = final_condition & cond
            filtered_data = data[final_condition]
        else:
            filtered_data = data
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
        if 'name' in data and 'criteria' in data:  # Custom segment creation
            if PREPROCESSED_DATA is None:
                return jsonify({'error': 'No dataset uploaded yet.'}), 400
            segments = read_segments()
            new_segment = {
                'id': max([s['id'] for s in segments], default=4) + 1,
                'name': data['name'],
                'criteria': data['criteria'],
                'source': 'Custom'
            }
            filtered_data = filter_data_by_criteria(RAW_DATA.copy(), data['criteria'], None)
            new_segment['count'] = len(filtered_data)
            segments.append(new_segment)
            write_segments(segments)
            return jsonify(new_segment), 201
        else:  # Individual customer segmentation
            valid, error = validate_input(data if not isinstance(data, list) else data[0])
            if not valid:
                return jsonify({'error': error}), 400
            new_customers = pd.DataFrame(data if isinstance(data, list) else [data])
            results = []
            customers = read_customers()
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
                spending_map = {'<50,000': 500, '50,000-100,000': 1500, '100,000-200,000': 3000, '>200,000': 5000}
                predicted_value = spending_map.get(customer.get('Average spending', '<50,000'), 1000)
                churn_risk = 50 if cluster == 3 else (20 if cluster == 0 else 10)
                next_purchase = (datetime.now() + timedelta(days=np.random.randint(5, 30))).strftime('%Y-%m-%d')
                customer_id = len(customers) + 1000
                new_customer = {
                    'id': customer_id,
                    'name': customer.get('name', f"Customer {customer_id}"),
                    'segment': CLUSTER_PROFILES[cluster]["description"],
                    'churnRisk': churn_risk,
                    'predictedValue': predicted_value,
                    'nextPurchase': next_purchase
                }
                customers.append(new_customer)
                results.append({
                    'id': customer_id,
                    'cluster': int(cluster),
                    'description': CLUSTER_PROFILES[cluster]["description"],
                    'nextPurchase': next_purchase,
                    'status': 'success'
                })
            write_customers(customers)
            return jsonify(results if isinstance(data, list) else results[0])
    except Exception as e:
        logging.error(f"Error in segment_customer: {str(e)}")
        return jsonify({'error': str(e), 'status': 'error'}), 400

@app.route('/dashboard', methods=['GET'])
def get_dashboard_data():
    try:
        customers = read_customers()
        total_customers = len(customers)
        total_revenue = sum(c['predictedValue'] for c in customers)
        churn_risk_count = sum(1 for c in customers if c['churnRisk'] >= 50)
        key_metrics = [
            {
                "id": 1,
                "title": "Predicted Revenue",
                "value": f"{total_revenue:,}",
                "trend": 8.2,
                "confidence": 94,
                "shortDescription": "Expected revenue based on customer segments",
                "modelExplanation": "Based on historical spending patterns",
                "influencers": [{"name": "Average Spending", "impact": 15}, {"name": "Shopping Frequency", "impact": 10}]
            },
            {
                "id": 2,
                "title": "Churn Risk",
                "value": f"{(churn_risk_count / total_customers * 100) if total_customers > 0 else 0:.1f}%",
                "trend": -1.2,
                "confidence": 89,
                "shortDescription": "Percentage of customers at high risk of leaving",
                "modelExplanation": "Calculated from cluster characteristics",
                "influencers": [{"name": "Satisfaction Rate", "impact": -20}, {"name": "Product Availability", "impact": -15}]
            },
            {
                "id": 3,
                "title": "Customer Lifetime Value",
                "value": f"{int(total_revenue / total_customers) if total_customers > 0 else 2450:,}",
                "trend": 5.5,
                "confidence": 91,
                "shortDescription": "Average CLV across all segments",
                "modelExplanation": "Derived from predicted value and retention",
                "influencers": [{"name": "Segment Type", "impact": 12}, {"name": "Purchase Frequency", "impact": 8}]
            }
        ]
        return jsonify({
            "keyMetrics": key_metrics,
            "customerPredictions": customers
        })
    except Exception as e:
        logging.error(f"Error in get_dashboard_data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/recommendations', methods=['GET'])
def get_recommendations():
    try:
        customers = read_customers()
        churn_risk_count = sum(1 for c in customers if c['churnRisk'] >= 50)
        high_spenders = sum(1 for c in customers if c['predictedValue'] > 3000)
        recommendations = [
            {
                "id": 1,
                "title": "Target At-Risk Customers",
                "description": f"Engage {churn_risk_count} at-risk customers with personalized promotions",
                "priority": "High",
                "impact": "+15% Retention",
                "confidence": 88
            },
            {
                "id": 2,
                "title": "Upsell High Spenders",
                "description": f"Target {high_spenders} high-value customers with premium offerings",
                "priority": "Medium",
                "impact": "+10% Revenue",
                "confidence": 76
            }
        ]
        available_recommendations = [r for r in recommendations if r['id'] not in IMPLEMENTED_RECOMMENDATIONS]
        return jsonify(available_recommendations)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/implement-recommendation', methods=['POST'])
def implement_recommendation():
    try:
        data = request.get_json()
        if not data or 'id' not in data:
            return jsonify({'error': 'Recommendation ID required'}), 400
        recommendation_id = data['id']
        IMPLEMENTED_RECOMMENDATIONS.add(recommendation_id)
        return jsonify({
            "status": "success",
            "message": f"Recommendation {recommendation_id} implemented"
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/query', methods=['GET'])
def query_data():
    try:
        # Check if dataset is loaded
        if RAW_DATA is None:
            return jsonify({'error': 'No dataset uploaded yet. Please upload System Data.csv.'}), 400

        # Get filter parameters from the query string
        filters = {
            'Age': request.args.get('age'),
            'Gender': request.args.get('gender'),
            'Region': request.args.get('region'),
            'Average spending': request.args.get('spending')
        }

        # Keep only filters with values
        active_filters = {k: v for k, v in filters.items() if v}

        # Start with the full dataset
        filtered_data = RAW_DATA.copy()

        # Apply each filter to the dataset
        for key, value in active_filters.items():
            # Ensure the column exists in the dataset
            if key not in filtered_data.columns:
                return jsonify({'error': f"Column {key} not found in dataset"}), 400
            # Filter rows where the column matches the provided value
            filtered_data = filtered_data[filtered_data[key] == value]

        # Calculate total number of matching records
        total = len(filtered_data)

        # Initialize counts dictionary
        counts = {}

        # Handle output based on number of filters
        if len(active_filters) == 0:
            # No filters: return total count
            counts = {"total": total}
        elif len(active_filters) == 1:
            # Single filter: return counts grouped by the filtered column
            key = list(active_filters.keys())[0]
            counts[key.lower()] = filtered_data[key].value_counts().to_dict()
        else:
            # Multiple filters: return total count
            counts = {"total": total}

        return jsonify({
            "counts": counts,
            "total": total
        })
    except Exception as e:
        logging.error(f"Error in query_data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/reports', methods=['GET'])
def get_reports():
    try:
        return jsonify({'reports': REPORTS})
    except Exception as e:
        logging.error(f"Error fetching reports: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/reports/generate', methods=['POST'])
def generate_report():
    try:
        data = request.get_json()
        report_type = data.get('type', 'Segmentation')
        customers = read_customers()
        if not customers:
            return jsonify({'error': 'No customer data available to generate report'}), 400
        total_customers = len(customers)
        churn_risk_count = sum(1 for c in customers if c['churnRisk'] >= 50)
        high_spenders = sum(1 for c in customers if c['predictedValue'] > 3000)
        avg_predicted_value = sum(c['predictedValue'] for c in customers) / total_customers if total_customers > 0 else 0
        report = {
            'id': len(REPORTS) + 1,
            'title': f"Customer Segmentation Report {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            'type': report_type,
            'generated_at': datetime.now().isoformat(),
            'metrics': {
                'total_customers': total_customers,
                'churn_risk_percentage': f"{(churn_risk_count / total_customers * 100):.1f}%" if total_customers > 0 else "0.0%",
                'high_spenders': high_spenders,
                'avg_predicted_value': f"UGX {int(avg_predicted_value):,}"
            }
        }
        filename = f"report_{report['id']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = os.path.join(REPORTS_DIR, filename)
        generate_pdf_report(filepath, report, customers[:10])
        report['file_url'] = f"/reports/{filename}"
        REPORTS.append(report)
        return jsonify(report), 201
    except Exception as e:
        logging.error(f"Error generating report: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/reports/<path:filename>', methods=['GET'])
def serve_report(filename):
    try:
        return send_file(os.path.join(REPORTS_DIR, filename), as_attachment=True)
    except Exception as e:
        logging.error(f"Error serving report: {str(e)}")
        return jsonify({'error': str(e)}), 404

@app.route('/static/img/<path:filename>')
def serve_img(filename):
    try:
        return send_file(os.path.join(STATIC_IMG_DIR, filename))
    except Exception as e:
        return jsonify({'error': str(e)}), 404

def generate_pdf_report(filepath, report, customers):
    doc = SimpleDocTemplate(filepath, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []
    elements.append(Paragraph(report['title'], styles['Title']))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(f"Generated: {report['generated_at']}", styles['Normal']))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph("Key Metrics", styles['Heading2']))
    metrics_data = [[key.replace('_', ' ').title(), value] for key, value in report['metrics'].items()]
    metrics_table = Table(metrics_data, colWidths=[200, 200])
    metrics_table.setStyle([('GRID', (0, 0), (-1, -1), 1, 'black'), ('ALIGN', (1, 0), (-1, -1), 'RIGHT')])
    elements.append(metrics_table)
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("Customer Sample (Top 10)", styles['Heading2']))
    customer_data = [['ID', 'Name', 'Segment', 'Churn Risk', 'Predicted Value', 'Next Purchase']]
    for c in customers:
        customer_data.append([c['id'], c['name'], c['segment'], f"{c['churnRisk']}%", f"UGX {c['predictedValue']:,}", c['nextPurchase']])
    customer_table = Table(customer_data, colWidths=[50, 100, 150, 70, 80, 100])
    customer_table.setStyle([('GRID', (0, 0), (-1, -1), 1, 'black'), ('ALIGN', (0, 0), (-1, -1), 'CENTER'), ('BACKGROUND', (0, 0), (-1, 0), '#d3d3d3')])
    elements.append(customer_table)
    doc.build(elements)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)