from flask import Flask, request, jsonify, send_file, render_template 
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
import matplotlib
matplotlib.use('Agg')  # Set the backend to Agg before importing pyplot
import matplotlib.pyplot as plt
import seaborn as sns
from io import BytesIO
import base64

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:8080", "http://127.0.0.1:8080"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type"]
    }
})
logging.basicConfig(level=logging.INFO)

# Configuration
MODEL_FILES = {
    'kmeans': 'kmeans_model.pkl',
    'scaler': 'scaler.pkl',
    'encoders': 'label_encoders.pkl'
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
CLUSTER_PROFILES_FILE = os.path.join(BASE_DIR, 'cluster_profiles.json')
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

def generate_cluster_profiles():
    try:
        kmeans = ml_artifacts['kmeans']
        scaler = ml_artifacts['scaler']
        encoders = ml_artifacts['encoders']
        n_clusters = kmeans.n_clusters
        cluster_centers = scaler.inverse_transform(kmeans.cluster_centers_)
        
        profiles = {}
        for i in range(n_clusters):
            traits = []
            center = cluster_centers[i]
            
            # Map numerical columns
            for idx, col in enumerate(CATEGORICAL_COLS + NUMERICAL_COLS):
                if col in CATEGORICAL_COLS and col in encoders:
                    # Find closest category
                    encoded_values = encoders[col].transform(encoders[col].classes_)
                    closest_idx = np.argmin(np.abs(encoded_values - center[idx]))
                    traits.append(f"{col}: {encoders[col].classes_[closest_idx]}")
                elif col in NUMERICAL_COLS:
                    traits.append(f"{col}: {center[idx]:.2f}")
            
            # Generate description based on key traits
            age = next((t for t in traits if t.startswith('Age:')), 'Age: Unknown')
            income = next((t for t in traits if t.startswith('Monthly Income:')), 'Monthly Income: Unknown')
            spending = next((t for t in traits if t.startswith('Average spending:')), 'Average spending: Unknown')
            frequency = next((t for t in traits if t.startswith('Frequency of Shopping(Regular):')), 'Frequency of Shopping: Unknown')
            
            description = f"{age.split(': ')[1]} Shoppers with {income.split(': ')[1]} Income"
            if 'Rarely' in frequency:
                description += ", Occasional"
            elif 'Daily' in frequency or 'Weekly' in frequency:
                description += ", Frequent"
            
            profiles[str(i)] = {  # Use string keys for JSON compatibility
                "description": description,
                "traits": ", ".join([age, income, spending, frequency])
            }
        
        # Save to JSON
        with open(CLUSTER_PROFILES_FILE, 'w') as f:
            json.dump(profiles, f, indent=2)
        
        return profiles
    except Exception as e:
        logging.error(f"Error generating cluster profiles: {str(e)}")
        return {}

def load_cluster_profiles():
    try:
        with open(CLUSTER_PROFILES_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return generate_cluster_profiles()

def filter_data_by_criteria(data, criteria, cluster_id=None):
    try:
        filtered_data = data.copy()
        logging.info(f"Starting with {len(filtered_data)} records")

        def apply_single_filter(field, value):
            nonlocal filtered_data
            try:
                original_count = len(filtered_data)
                
                if field in ['Monthly Income', 'Average spending', 'Rate of Satisfaction', 'Rate of availability of products']:
                    if isinstance(value, str):
                        value = value.strip()
                        operator = None
                        if value.startswith('<'):
                            operator = '<'
                            value = value[1:].replace(',', '').strip()
                        elif value.startswith('>'):
                            operator = '>'
                            value = value[1:].replace(',', '').strip()
                        else:
                            value = value.replace(',', '').strip()
                        logging.debug(f"Processing {field} with value: {value}, operator: {operator}")
                        
                        try:
                            if filtered_data[field].dtype == 'object':
                                numeric_data = pd.to_numeric(
                                    filtered_data[field].str.replace(',', '').str.strip(),
                                    errors='coerce'
                                )
                            else:
                                numeric_data = filtered_data[field].astype(float)
                            
                            original_len = len(filtered_data)
                            filtered_data['numeric_temp'] = numeric_data
                            filtered_data = filtered_data[filtered_data['numeric_temp'].notna()]
                            numeric_data = filtered_data['numeric_temp']
                            logging.debug(f"Rows after NaN removal: {original_len} → {len(filtered_data)}")
                            
                            if operator == '<':
                                threshold = float(value)
                                filtered_data = filtered_data[numeric_data < threshold]
                            elif operator == '>':
                                threshold = float(value)
                                filtered_data = filtered_data[numeric_data > threshold]
                            elif '-' in value:
                                low, high = map(float, value.split('-'))
                                filtered_data = filtered_data[
                                    (numeric_data >= low) & (numeric_data <= high)
                                ]
                            else:
                                target_value = float(value)
                                filtered_data = filtered_data[numeric_data == target_value]
                            
                            filtered_data = filtered_data.drop(columns=['numeric_temp'])
                        
                        except ValueError as e:
                            logging.error(f"Invalid numeric format for {field}: value='{value}', error={str(e)}")
                            return False
                        except Exception as e:
                            logging.error(f"Unexpected error processing {field}: value='{value}', error={str(e)}")
                            return False
                
                elif field == 'Age':
                    if '-' in value:
                        low, high = map(int, value.split('-'))
                        filtered_data = filtered_data[
                            filtered_data['Age'].str.match(f"^{low}-{high}$", na=False)
                        ]
                    else:
                        filtered_data = filtered_data[
                            filtered_data['Age'].astype(str).str.strip() == value.strip()
                        ]
                
                else:
                    filtered_data = filtered_data[
                        filtered_data[field].astype(str).str.strip().str.lower() == value.strip().lower()
                    ]
                
                logging.info(f"Filter: {field}={value} | {original_count} → {len(filtered_data)} records")
                return True
                
            except Exception as e:
                logging.error(f"Failed to apply {field}={value}: {str(e)}")
                return False

        if isinstance(criteria, str):
            criteria_parts = [part.strip() for part in criteria.split(',') if part.strip()]
            for part in criteria_parts:
                fields = [
                    'Age', 'Gender', 'Region', 'Monthly Income', 
                    'Average spending', 'Frequency of Shopping(Regular)',
                    'Categories', 'Rate of Satisfaction',
                    'Rate of availability of products', 'Internet connection used',
                    'Device to shop'
                ]
                
                applied = False
                for field in fields:
                    if part.startswith(field):
                        value = part[len(field):].strip()
                        if not apply_single_filter(field, value):
                            raise ValueError(f"Invalid criteria format: {part}")
                        applied = True
                        break
                
                if not applied:
                    raise ValueError(f"Unrecognized field in criteria: {part}")
        
        elif isinstance(criteria, dict):
            for field, value in criteria.items():
                if not apply_single_filter(field, str(value)):
                    raise ValueError(f"Invalid criteria: {field}={value}")
        
        else:
            raise ValueError("Criteria must be string or dictionary")

        if cluster_id is not None and 'Cluster' in filtered_data.columns:
            filtered_data = filtered_data[filtered_data['Cluster'] == cluster_id]

        logging.info(f"Final filtered count: {len(filtered_data)}")
        return filtered_data

    except Exception as e:
        logging.error(f"Filtering failed: {str(e)}")
        raise ValueError(f"Failed to filter data: {str(e)}")

def generate_visualizations(df):
    try:
        os.makedirs(STATIC_IMG_DIR, exist_ok=True)
        for filename in os.listdir(STATIC_IMG_DIR):
            if filename.endswith('.png'):
                os.remove(os.path.join(STATIC_IMG_DIR, filename))

        base64_images = {}

        plt.figure(figsize=(10, 6))
        sns.countplot(data=df, x='Age', order=sorted(df['Age'].unique()))
        plt.title('Age Distribution')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig(os.path.join(STATIC_IMG_DIR, 'age_distribution.png'))
        plt.close()

        plt.figure(figsize=(10, 6))
        sns.countplot(data=df, x='Average spending',
                      order=['<50,000', '50,000-100,000', '100,000-200,000', '>200,000'])
        plt.title('Average Spending Distribution')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig(os.path.join(STATIC_IMG_DIR, 'avg_spending_distribution.png'))
        plt.close()

        if 'Cluster' in df.columns:
            cluster_stats = df.groupby('Cluster').agg({
                'Average spending': lambda x: x.map({
                    '<50,000': 1, '50,000-100,000': 2, '100,000-200,000': 3, '>200,000': 4
                }).mean(),
                'Rate of Satisfaction': 'mean',
                'Frequency of Shopping(Regular)': lambda x: x.map({
                    'Daily': 4, 'Weekly': 3, 'Monthly': 2, 'Rarely': 1
                }).mean(),
                'Monthly Income': lambda x: x.map({
                    '<450,000': 1, '450,000-1,000,000': 2, '1,000,000-2,000,000': 3, '>2,000,000': 4
                }).mean()
            })

            plt.figure(figsize=(12, 8))
            sns.heatmap(
                cluster_stats.T,
                annot=True,
                cmap='YlGnBu',
                fmt='.2f',
                linewidths=.5,
                cbar_kws={'label': 'Average Value'}
            )
            plt.title('Average Characteristics by Cluster', pad=20)
            plt.xlabel('Cluster')
            plt.ylabel('Feature')

            img = BytesIO()
            plt.savefig(img, format='png', bbox_inches='tight', dpi=300)
            plt.close()
            img.seek(0)
            base64_images['cluster_characteristics'] = base64.b64encode(img.getvalue()).decode('utf-8')

        if 'Cluster' in df.columns:
            from sklearn.metrics import silhouette_samples, silhouette_score
            df_encoded = df.copy()
            for col in CATEGORICAL_COLS:
                if col in df_encoded.columns:
                    df_encoded[col] = df_encoded[col].fillna('Unknown')
                    df_encoded[col] = ml_artifacts['encoders'][col].transform(df_encoded[col])
            X = df_encoded[CATEGORICAL_COLS + NUMERICAL_COLS].copy()
            for col in (CATEGORICAL_COLS + NUMERICAL_COLS):
                if col not in X.columns:
                    X[col] = 0
            X_scaled = ml_artifacts['scaler'].transform(X)

            silhouette_avg = silhouette_score(X_scaled, df['Cluster'])
            sample_silhouette_values = silhouette_samples(X_scaled, df['Cluster'])

            plt.figure(figsize=(10, 6))
            y_lower = 10
            n_clusters = ml_artifacts['kmeans'].n_clusters
            for i in range(n_clusters):
                ith_cluster_values = sample_silhouette_values[df['Cluster'] == i]
                ith_cluster_values.sort()
                size_cluster_i = ith_cluster_values.shape[0]
                y_upper = y_lower + size_cluster_i
                color = plt.cm.viridis(float(i) / n_clusters)
                plt.fill_betweenx(np.arange(y_lower, y_upper), 0, ith_cluster_values,
                                  facecolor=color, edgecolor=color, alpha=0.7)
                plt.text(-0.05, y_lower + 0.5 * size_cluster_i, str(i))
                y_lower = y_upper + 10
            plt.axvline(x=silhouette_avg, color="red", linestyle="--")
            plt.title(f"Silhouette Analysis (Avg Score: {silhouette_avg:.2f})")
            plt.xlabel("Silhouette Coefficient")
            plt.ylabel("Cluster")

            img = BytesIO()
            plt.savefig(img, format='png', bbox_inches='tight', dpi=300)
            plt.close()
            img.seek(0)
            base64_images['silhouette_analysis'] = base64.b64encode(img.getvalue()).decode('utf-8')

        if 'Region' in df.columns:
            plt.figure(figsize=(10, 6))
            sns.countplot(data=df, x='Region')
            plt.title('Region Distribution')
            plt.xticks(rotation=45)
            plt.tight_layout()
            plt.savefig(os.path.join(STATIC_IMG_DIR, 'region_distribution.png'))
            plt.close()

        if 'Frequency of Shopping(Regular)' in df.columns:
            plt.figure(figsize=(10, 6))
            sns.countplot(data=df, x='Frequency of Shopping(Regular)',
                          order=['Daily', 'Weekly', 'Monthly', 'Rarely'])
            plt.title('Shopping Frequency')
            plt.xticks(rotation=45)
            plt.tight_layout()
            plt.savefig(os.path.join(STATIC_IMG_DIR, 'shopping_frequency.png'))
            plt.close()

        return True, base64_images
    except Exception as e:
        logging.error(f"Error generating visualizations: {str(e)}")
        return False, {}

def load_and_preprocess_data(filepath):
    try:
        data = pd.read_csv(filepath)
        data.columns = [col.strip() for col in data.columns]
        logging.info("Dataset loaded successfully")
        logging.info(f"Available columns in dataset: {list(data.columns)}")
        preprocessed_data = preprocess_dataset(data)
        generate_cluster_profiles()  # Generate and save cluster profiles after preprocessing
        return data, preprocessed_data
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
            segments = json.load(f)
        valid_segments = []
        for segment in segments:
            if not isinstance(segment, dict):
                logging.warning(f"Invalid segment format, skipping: {segment}")
                continue
            if 'criteria' not in segment or not segment['criteria']:
                logging.warning(f"Segment missing 'criteria' field, setting default: {segment}")
                segment['criteria'] = "Unknown criteria"
            if 'name' not in segment or not segment['name']:
                logging.warning(f"Segment missing 'name' field, setting default: {segment}")
                segment['name'] = f"Unnamed Segment {segment.get('id', 'Unknown')}"
            valid_segments.append(segment)
        return valid_segments
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
                    'endpoints': ['/upload', '/segments', '/segments/import', '/segments/model', '/segment',
                                  '/dashboard', '/dashboard/visual', '/query',
                                  '/recommendations', '/implement-recommendation', '/reports', '/reports/generate',
                                  '/graphs', '/graphs/generate']})

@app.route('/upload', methods=['POST'])
def upload_dataset():
    global RAW_DATA, PREPROCESSED_DATA
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in request'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        file_ext = file.filename.rsplit('.', 1)[-1].lower()
        if file_ext != 'csv':
            return jsonify({'error': 'Only CSV files are supported for dataset upload'}), 400
        file.save(UPLOADED_DATA_PATH)
        RAW_DATA, PREPROCESSED_DATA = load_and_preprocess_data(UPLOADED_DATA_PATH)
        if RAW_DATA is None or PREPROCESSED_DATA is None:
            return jsonify({'error': 'Failed to process uploaded dataset'}), 500

        generate_visualizations(RAW_DATA)
        return jsonify({
            'success': True,
            'message': 'Dataset uploaded and processed successfully',
            'path': UPLOADED_DATA_PATH
        }), 200
    except Exception as e:
        logging.error(f"Error in upload_dataset: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/graphs', methods=['GET'])
def get_available_graphs():
    try:
        graphs = []
        name_map = {
            'age_distribution.png': 'Age Distribution',
            'avg_spending_distribution.png': 'Average Spending Distribution',
            'cluster_characteristics': 'Cluster Characteristics',
            'silhouette_analysis': 'Silhouette Analysis',
            'region_distribution.png': 'Region Distribution',
            'shopping_frequency.png': 'Shopping Frequency'
        }

        if os.path.exists(STATIC_IMG_DIR):
            graph_files = os.listdir(STATIC_IMG_DIR)
            for filename in graph_files:
                if filename.endswith('.png'):
                    graphs.append({
                        "title": name_map.get(filename, filename.replace('_', ' ').title().replace('.png', '')),
                        "filename": filename,
                        "url": f"/static/img/{filename}",
                        "type": "file"
                    })

        if RAW_DATA is not None:
            success, base64_images = generate_visualizations(RAW_DATA)
            if success:
                for key, base64_data in base64_images.items():
                    graphs.append({
                        "title": name_map.get(key, key.replace('_', ' ').title()),
                        "filename": f"{key}.png",
                        "url": f"data:image/png;base64,{base64_data}",
                        "type": "base64"
                    })

        if not graphs:
            return jsonify({"error": "No graphs generated yet"}), 404

        return jsonify({"graphs": graphs})
    except Exception as e:
        logging.error(f"Error getting available graphs: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/graphs/generate', methods=['POST'])
def generate_graphs():
    try:
        if RAW_DATA is None:
            return jsonify({"error": "No dataset available"}), 400

        success, _ = generate_visualizations(RAW_DATA)
        if not success:
            return jsonify({"error": "Failed to generate some graphs"}), 500

        return jsonify({"success": True, "message": "Graphs generated successfully"})
    except Exception as e:
        logging.error(f"Error generating graphs: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/static/img/<path:filename>')
def serve_img(filename):
    try:
        return send_file(os.path.join(STATIC_IMG_DIR, filename))
    except Exception as e:
        logging.error(f"Error serving image: {str(e)}")
        return jsonify({'error': str(e)}), 404

@app.route('/dashboard/visual', methods=['GET'])
def visual_dashboard():
    try:
        graphs = []
        name_map = {
            'age_distribution.png': 'Age Distribution',
            'avg_spending_distribution.png': 'Average Spending Distribution',
            'cluster_characteristics': 'Cluster Characteristics',
            'silhouette_analysis': 'Silhouette Analysis',
            'region_distribution.png': 'Region Distribution',
            'shopping_frequency.png': 'Shopping Frequency'
        }

        if os.path.exists(STATIC_IMG_DIR):
            graph_files = os.listdir(STATIC_IMG_DIR)
            for filename in graph_files:
                if filename.endswith('.png'):
                    graphs.append({
                        "title": name_map.get(filename, filename.replace('_', ' ').title().replace('.png', '')),
                        "url": f"/static/img/{filename}"
                    })

        if RAW_DATA is not None:
            success, base64_images = generate_visualizations(RAW_DATA)
            if success:
                for key, base64_data in base64_images.items():
                    graphs.append({
                        "title": name_map.get(key, key.replace('_', ' ').title()),
                        "url": f"data:image/png;base64,{base64_data}"
                    })

        return render_template('dashboard.html', graphs=graphs)
    except Exception as e:
        logging.error(f"Error rendering visual dashboard: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/segments/import', methods=['POST'])
def import_segments():
    global RAW_DATA, PREPROCESSED_DATA
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in request'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        file_ext = file.filename.rsplit('.', 1)[-1].lower()
        if file_ext not in ['csv', 'json']:
            return jsonify({'error': 'Invalid file type. Only CSV and JSON are supported'}), 400

        if file_ext == 'csv':
            file.save(UPLOADED_DATA_PATH)
            RAW_DATA, PREPROCESSED_DATA = load_and_preprocess_data(UPLOADED_DATA_PATH)
            if RAW_DATA is None or PREPROCESSED_DATA is None:
                return jsonify({'error': 'Failed to process uploaded CSV dataset'}), 500
        else:
            json_data = json.load(file)
            if not isinstance(json_data, list):
                return jsonify({'error': 'JSON file must contain an array of segment objects'}), 400
            required_fields = ['name', 'criteria']
            for segment in json_data:
                if not all(field in segment for field in required_fields):
                    return jsonify({'error': f'Missing required fields: {required_fields}'}), 400
            segments = read_segments()
            max_id = max([s['id'] for s in segments], default=4)
            for segment in json_data:
                max_id += 1
                new_segment = {
                    'id': max_id,
                    'name': segment['name'],
                    'criteria': segment['criteria'],
                    'source': 'Custom',
                    'createdAt': datetime.now().isoformat()
                }
                filtered_data = filter_data_by_criteria(RAW_DATA.copy(), segment['criteria'], None) if RAW_DATA is not None else pd.DataFrame()
                new_segment['count'] = len(filtered_data)
                segments.append(new_segment)
            write_segments(segments)

        return jsonify({'success': True, 'message': f'{file_ext.upper()} file processed successfully'}), 200
    except Exception as e:
        logging.error(f"Error in import_segments: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/segments', methods=['GET'])
def get_segments():
    try:
        if PREPROCESSED_DATA is None:
            return jsonify({'error': 'No dataset uploaded yet. Please upload a CSV dataset first.'}), 400
        cluster_profiles = load_cluster_profiles()
        cluster_counts = PREPROCESSED_DATA['Cluster'].value_counts().to_dict()
        n_clusters = ml_artifacts['kmeans'].n_clusters
        model_segments = [
            {
                "id": i + 1,
                "name": f"Cluster {i}",
                "count": cluster_counts.get(i, 0),
                "criteria": cluster_profiles.get(str(i), {}).get("traits", "Unknown traits"),
                "source": "Model",
                "createdAt": datetime.now().isoformat()
            }
            for i in range(n_clusters)
        ]
        custom_segments = read_segments()
        for segment in custom_segments:
            criteria = segment.get('criteria', 'Unknown criteria')
            filtered_data = filter_data_by_criteria(RAW_DATA.copy(), criteria, None)
            segment['count'] = len(filtered_data)
            segment['source'] = "Custom"
        return jsonify(model_segments + custom_segments)
    except Exception as e:
        logging.error(f"Error in get_segments: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/segments/model', methods=['GET'])
def get_model_segments():
    try:
        if PREPROCESSED_DATA is None:
            return jsonify({'error': 'No dataset uploaded yet. Please upload a CSV dataset first.'}), 400
        cluster_profiles = load_cluster_profiles()
        cluster_counts = PREPROCESSED_DATA['Cluster'].value_counts().to_dict()
        n_clusters = ml_artifacts['kmeans'].n_clusters
        model_segments = [
            {
                "id": i + 1,
                "name": f"Cluster {i}",
                "count": cluster_counts.get(i, 0),
                "criteria": cluster_profiles.get(str(i), {}).get("traits", "Unknown traits"),
                "source": "Model",
                "createdAt": datetime.now().isoformat()
            }
            for i in range(n_clusters)
        ]
        return jsonify(model_segments)
    except Exception as e:
        logging.error(f"Error in get_model_segments: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/segments/<int:segment_id>', methods=['PUT'])
def update_segment(segment_id):
    global PREPROCESSED_DATA, RAW_DATA
    try:
        if PREPROCESSED_DATA is None or RAW_DATA is None:
            return jsonify({'error': 'No dataset uploaded yet. Please upload a CSV dataset first.'}), 400
        data = request.get_json()
        if not data or 'criteria' not in data:
            return jsonify({'error': 'Criteria field is required'}), 400
        new_criteria = data['criteria'] or "Unknown criteria"
        n_clusters = ml_artifacts['kmeans'].n_clusters
        if segment_id <= n_clusters:
            cluster_id = segment_id - 1
            cluster_profiles = load_cluster_profiles()
            if str(cluster_id) not in cluster_profiles:
                return jsonify({'error': f"Invalid segment ID: {segment_id}"}), 404
            cluster_profiles[str(cluster_id)]["traits"] = new_criteria
            with open(CLUSTER_PROFILES_FILE, 'w') as f:
                json.dump(cluster_profiles, f, indent=2)
            filtered_data = filter_data_by_criteria(RAW_DATA.copy(), new_criteria, cluster_id)
            PREPROCESSED_DATA = preprocess_dataset(filtered_data)
            cluster_counts = PREPROCESSED_DATA['Cluster'].value_counts().to_dict()
            updated_segment = {
                "id": segment_id,
                "name": f"Cluster {cluster_id}",
                "count": cluster_counts.get(cluster_id, 0),
                "criteria": new_criteria,
                "source": "Model",
                "createdAt": datetime.now().isoformat()
            }
        else:
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
        n_clusters = ml_artifacts['kmeans'].n_clusters
        if segment_id <= n_clusters:
            return jsonify({'error': 'Cannot delete model-defined segments'}), 403
        segments = read_segments()
        segment = next((s for s in segments if s['id'] == segment_id), None)
        if not segment:
            return jsonify({'error': f"Segment ID {segment_id} not found"}), 404
        segments = [s for s in segments if s['id'] != segment_id]
        write_segments(segments)
        return jsonify({'message': f"Segment {segment_id} deleted"}), 200
    except Exception as e:
        logging.error(f"Error in delete_segment: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/segment', methods=['POST'])
def segment_customer():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        cluster_profiles = load_cluster_profiles()
        if 'name' in data and 'criteria' in data:
            if PREPROCESSED_DATA is None or RAW_DATA is None:
                return jsonify({'error': 'No dataset uploaded yet. Please upload a CSV dataset first.'}), 400
            if 'Gender' in RAW_DATA.columns:
                unique_genders = RAW_DATA['Gender'].unique().tolist()
                logging.info(f"Unique values in Gender column: {unique_genders}")
            else:
                logging.warning("Gender column not found in RAW_DATA")
            segments = read_segments()
            new_segment = {
                'id': max([s['id'] for s in segments], default=4) + 1,
                'name': data['name'],
                'criteria': data['criteria'] or "Unknown criteria",
                'source': 'Custom',
                'createdAt': datetime.now().isoformat()
            }
            filtered_data = filter_data_by_criteria(RAW_DATA.copy(), new_segment['criteria'], None)
            logging.info(f"Filtered data size for criteria '{new_segment['criteria']}': {len(filtered_data)}")
            new_segment['count'] = len(filtered_data)
            segments.append(new_segment)
            write_segments(segments)
            return jsonify(new_segment), 201
        else:
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
                    'segment': cluster_profiles.get(str(cluster), {}).get("description", "Unknown Segment"),
                    'churnRisk': churn_risk,
                    'predictedValue': predicted_value,
                    'nextPurchase': next_purchase
                }
                customers.append(new_customer)
                results.append({
                    'id': customer_id,
                    'cluster': int(cluster),
                    'description': cluster_profiles.get(str(cluster), {}).get("description", "Unknown Segment"),
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
                "influencers": [{"name": "Average Spending", "impact": 15},
                                {"name": "Shopping Frequency", "impact": 10}]
            },
            {
                "id": 2,
                "title": "Churn Risk",
                "value": f"{(churn_risk_count / total_customers * 100) if total_customers > 0 else 0:.1f}%",
                "trend": -1.2,
                "confidence": 89,
                "shortDescription": "Percentage of customers at high risk of leaving",
                "modelExplanation": "Calculated from cluster characteristics",
                "influencers": [{"name": "Satisfaction Rate", "impact": -20},
                                {"name": "Product Availability", "impact": -15}]
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
        logging.error(f"Error in get_recommendations: {str(e)}")
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
        logging.error(f"Error in implement_recommendation: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/query', methods=['GET'])
def query_data():
    try:
        if RAW_DATA is None:
            return jsonify({'error': 'No dataset uploaded yet. Please upload a CSV dataset first.'}), 400
        filters = {
            'Age': request.args.get('age'),
            'Gender': request.args.get('gender'),
            'Region': request.args.get('region'),
            'Average spending': request.args.get('spending')
        }
        active_filters = {k: v for k, v in filters.items() if v}
        filtered_data = RAW_DATA.copy()
        for key, value in active_filters.items():
            if key not in filtered_data.columns:
                return jsonify({'error': f"Column {key} not found in dataset"}), 400
            filtered_data = filtered_data[filtered_data[key] == value]
        total = len(filtered_data)
        counts = {}
        def spending_to_numeric(spending):
            try:
                if pd.isna(spending):
                    return 0
                spending = str(spending).strip()
                if '<' in spending:
                    return float(spending.replace('<', '').replace(',', ''))
                elif '>' in spending:
                    return float(spending.replace('>', '').replace(',', ''))
                elif '-' in spending:
                    low, high = spending.split('-')
                    return (float(low.replace(',', '')) + float(high.replace(',', ''))) / 2
                return float(spending.replace(',', ''))
            except (ValueError, AttributeError):
                return 0
        response = {
            "counts": counts,
            "total": total
        }
        if len(active_filters) == 0:
            counts = {"total": total}
            most_frequent_category = "Unknown"
            if 'Categories' in filtered_data.columns and not filtered_data['Categories'].empty:
                most_frequent_category = filtered_data['Categories'].mode().iloc[0] if filtered_data['Categories'].notna().any() else "Unknown"
            avg_spending = 0
            if 'Average spending' in filtered_data.columns and not filtered_data['Average spending'].empty:
                filtered_data['spending_numeric'] = filtered_data['Average spending'].apply(spending_to_numeric)
                avg_spending = filtered_data['spending_numeric'].mean()
                if pd.isna(avg_spending):
                    avg_spending = 0
            response.update({
                "most_frequent_category": most_frequent_category,
                "average_spending": avg_spending,
                "most_purchased_category": most_frequent_category
            })
        elif len(active_filters) == 1:
            filter_key = list(active_filters.keys())[0]
            filter_value = active_filters[filter_key]
            counts[filter_key.lower()] = {filter_value: total}
            most_frequent_category = "Unknown"
            if 'Categories' in filtered_data.columns and not filtered_data['Categories'].empty:
                most_frequent_category = filtered_data['Categories'].mode().iloc[0] if filtered_data['Categories'].notna().any() else "Unknown"
            avg_spending = 0
            if 'Average spending' in filtered_data.columns and not filtered_data['Average spending'].empty:
                filtered_data['spending_numeric'] = filtered_data['Average spending'].apply(spending_to_numeric)
                avg_spending = filtered_data['spending_numeric'].mean()
                if pd.isna(avg_spending):
                    avg_spending = 0
            most_purchased_category = most_frequent_category
            highest_spender = {}
            if 'Region' in RAW_DATA.columns and 'Average spending' in RAW_DATA.columns:
                region_data = RAW_DATA.copy()
                region_data['spending_numeric'] = region_data['Average spending'].apply(spending_to_numeric)
                region_avg = region_data.groupby('Region')['spending_numeric'].mean()
                if not region_avg.empty:
                    highest_region = region_avg.idxmax()
                    highest_region_spending = region_avg.max()
                    highest_spender['Region'] = {
                        "name": highest_region,
                        "spending": int(highest_region_spending) if pd.notna(highest_region_spending) else 0
                    }
                else:
                    highest_spender['Region'] = {"name": "Unknown", "spending": 0}
            if 'Age' in RAW_DATA.columns and 'Average spending' in RAW_DATA.columns:
                age_data = RAW_DATA.copy()
                age_data['spending_numeric'] = age_data['Average spending'].apply(spending_to_numeric)
                age_avg = age_data.groupby('Age')['spending_numeric'].mean()
                if not age_avg.empty:
                    highest_age = age_avg.idxmax()
                    highest_age_spending = age_avg.max()
                    highest_spender['Age'] = {
                        "name": highest_age,
                        "spending": int(highest_age_spending) if pd.notna(highest_age_spending) else 0
                    }
                else:
                    highest_spender['Age'] = {"name": "Unknown", "spending": 0}
            if 'Gender' in RAW_DATA.columns and 'Average spending' in RAW_DATA.columns:
                gender_data = RAW_DATA.copy()
                gender_data['spending_numeric'] = gender_data['Average spending'].apply(spending_to_numeric)
                gender_avg = gender_data.groupby('Gender')['spending_numeric'].mean()
                if not gender_avg.empty:
                    highest_gender = gender_avg.idxmax()
                    highest_gender_spending = gender_avg.max()
                    highest_spender['Gender'] = {
                        "name": highest_gender,
                        "spending": int(highest_gender_spending) if pd.notna(highest_gender_spending) else 0
                    }
                else:
                    highest_spender['Gender'] = {"name": "Unknown", "spending": 0}
            response.update({
                "filter_key": filter_key,
                "filter_value": filter_value,
                "most_frequent_category": most_frequent_category,
                "average_spending": avg_spending,
                "highest_spender": highest_spender,
                "most_purchased_category": most_purchased_category,
                "percentage": f"{(total / len(RAW_DATA) * 100):.1f}%" if len(RAW_DATA) > 0 else "0.0%"
            })
        else:
            counts = {"total": total}
            most_frequent_category = "Unknown"
            if 'Categories' in filtered_data.columns and not filtered_data['Categories'].empty:
                most_frequent_category = filtered_data['Categories'].mode().iloc[0] if filtered_data['Categories'].notna().any() else "Unknown"
            avg_spending = 0
            if 'Average spending' in filtered_data.columns and not filtered_data['Average spending'].empty:
                filtered_data['spending_numeric'] = filtered_data['Average spending'].apply(spending_to_numeric)
                avg_spending = filtered_data['spending_numeric'].mean()
                if pd.isna(avg_spending):
                    avg_spending = 0
            response.update({
                "most_frequent_category": most_frequent_category,
                "average_spending": avg_spending,
                "most_purchased_category": most_frequent_category
            })
        return jsonify(response)
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
        avg_predicted_value = sum(
            c['predictedValue'] for c in customers) / total_customers if total_customers > 0 else 0
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
        customer_data.append(
            [c['id'], c['name'], c['segment'], f"{c['churnRisk']}%", f"UGX {c['predictedValue']:,}", c['nextPurchase']])
    customer_table = Table(customer_data, colWidths=[50, 100, 150, 70, 80, 100])
    customer_table.setStyle([('GRID', (0, 0), (-1, -1), 1, 'black'), ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                             ('BACKGROUND', (0, 0), (-1, 0), '#d3d3d3')])
    elements.append(customer_table)
    doc.build(elements)

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)