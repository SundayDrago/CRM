import pandas as pd
import joblib

# Load the saved objects
kmeans = joblib.load('kmeans_model.pkl')
scaler = joblib.load('scaler.pkl')
label_encoders = joblib.load('label_encoders.pkl')

# Define column names
categorical_cols = ['Age', 'Gender', 'Monthly Income', 'Region', 'Frequency of Shopping(Regular)',
                    'Average spending', 'Categories', 'Means of Payment', 
                    'Enrolled on Jumia Prime or any loyalty program', 'Frequency of shopping(Occassional)',
                    'Reason for your purchase', 'Device to shop', 'Internet connection used',
                    'Recommendation to others']
numerical_cols = ['Rate of Satisfaction', 'Rate of availability of products']

# New customer data
new_customer = pd.DataFrame({
    'Age': ['25-34'],
    'Gender': ['Male'],
    'Monthly Income': ['<450,000'],
    'Region': ['Central'],
    'Frequency of Shopping(Regular)': ['Daily, A few times a year'],
    'Average spending': ['<50,000'],
    'Categories': ['Electronics'],
    'Means of Payment': ['Mobile Money, Cash on Delivery'],
    'Enrolled on Jumia Prime or any loyalty program': ['No'],
    'Frequency of shopping(Occassional)': ['Rarely'],
    'Reason for your purchase': ['Convenience, Delivery speed'],
    'Device to shop': ['Smart phones, Laptops'],
    'Internet connection used': ['Mobile data, Public Wi-Fi'],
    'Recommendation to others': ['Yes'],
    'Rate of Satisfaction': [3],
    'Rate of availability of products': [2]
})

# Preprocess the new data
for col in categorical_cols:
    try:
        new_customer[col] = label_encoders[col].transform(new_customer[col])
    except ValueError as e:
        print(f"Error encoding {col}: {e}. New value not seen during training.")
        # Handle unseen categories (e.g., assign a default value or skip)

# Combine and scale
X_new = new_customer[categorical_cols + numerical_cols]
X_new_scaled = scaler.transform(X_new)

# Predict cluster
cluster = kmeans.predict(X_new_scaled)[0]
print(f"New customer belongs to cluster: {cluster}") 