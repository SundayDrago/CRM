import sys
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Load your dataset (replace with actual database if applicable)
df = pd.read_csv('../System Data.csv')

# Parse time range
time_range = sys.argv[1]  # e.g., "7d", "30d", "90d"
days = int(time_range.replace('d', ''))
cutoff_date = datetime.now() - timedelta(days=days)

# Filter data based on time range
df['Timestamp'] = pd.to_datetime(df['Timestamp'])
filtered_df = df[df['Timestamp'] >= cutoff_date]

# Calculate analytics
total_customers = len(filtered_df)
churn_risk = (filtered_df['Rate of Satisfaction'] <= 2).mean() * 100  # Low satisfaction = churn risk
avg_spending = filtered_df['Average spending'].apply(
    lambda x: 50000 if x == '<50,000' else 75000 if x == '50,000-100,000' else 150000
).mean()
retention_rate = (filtered_df['Recommendation to others'] == 'Yes').mean() * 100

# Segment distribution
segments = filtered_df['Frequency of shopping'].value_counts(normalize=True) * 100

# Spending pattern forecast (simplified)
spending_trend = [avg_spending * (1 + i * 0.05) for i in range(4)]  # 5% monthly increase

# Top categories
categories = filtered_df['Categories'].value_counts().head(3)

# Retention forecast
retention_data = {
    'Loyal': retention_rate,
    'At Risk': churn_risk,
    'New': 100 - retention_rate - churn_risk
}

# Prepare response
analytics = {
    'keyMetrics': [
        {'title': 'Total Customers', 'value': str(total_customers), 'trend': 5, 'description': 'Total active customers.'},
        {'title': 'Predicted Churn Risk', 'value': f'{churn_risk:.1f}%', 'trend': -2, 'description': 'Percentage at risk of leaving.'},
        {'title': 'Avg Spending Forecast', 'value': f'${avg_spending:.0f}', 'trend': 10, 'description': 'Predicted average monthly spend.'},
        {'title': 'Retention Rate', 'value': f'{retention_rate:.1f}%', 'trend': 3, 'description': 'Percentage of retained customers.'},
    ],
    'chartData': {
        'segments': {'labels': segments.index.tolist(), 'data': segments.values.tolist()},
        'spending': {'labels': ['Month 1', 'Month 2', 'Month 3', 'Month 4'], 'data': spending_trend},
        'categories': {'labels': categories.index.tolist(), 'data': categories.values.tolist()},
        'retention': {'labels': list(retention_data.keys()), 'data': list(retention_data.values())}
    },
    'recentCustomers': filtered_df.tail(5).to_dict(orient='records')
}
print(json.dumps(analytics))