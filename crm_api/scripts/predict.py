import sys
import json
import joblib
import pandas as pd
import numpy as np

# Load the trained model and scaler
model = joblib.load('../svm_model.pkl')
scaler = joblib.load('../scaler.pkl')

# Parse input data from command line
input_data = json.loads(sys.argv[1])
df = pd.DataFrame([input_data])

# Preprocess the data (match training preprocessing)
numeric_cols = ['Rate of Satisfaction', 'Rate of availability of products']
categorical_cols = ['Age', 'Gender', 'Monthly Income', 'Region', 'Frequency of Shopping',
                    'Average spending', 'Categories', 'Means of Payment',
                    'Entrolled on Jumia Prime or any loyalty program',
                    'Reason for your purchase', 'Device to shop', 'Internet connection used']

# One-hot encode categorical variables
df_encoded = pd.get_dummies(df[categorical_cols])
X = pd.concat([df[numeric_cols], df_encoded], axis=1)

# Ensure all columns from training are present
training_cols = model.feature_names_in_
for col in training_cols:
    if col not in X.columns:
        X[col] = 0
X = X[training_cols]  # Reorder to match training

# Scale the features
X_scaled = scaler.transform(X)

# Predict
prediction = model.predict(X_scaled)[0]
probabilities = model.predict_proba(X_scaled)[0] if hasattr(model, 'predict_proba') else None

# Output result
result = {
    'prediction': int(prediction),
    'probabilities': probabilities.tolist() if probabilities is not None else None
}
print(json.dumps(result))