import requests
import json

# Test cases covering different customer profiles
test_cases = [
    {
        "name": "Budget Shopper",
        "data": {
            "Age": "25-34",
            "Gender": "Male",
            "Monthly Income": "200,000-500,000",
            "Region": "West",
            "Frequency of Shopping": "Monthly",
            "Average spending": "20,000-50,000",
            "Categories": "Electronics",
            "Means of Payment": "Debit Card",
            "Entrolled on Jumia Prime or any loyalty program": "No",
            "Frequency of shopping": "Rarely",
            "Reason for your purchase": "Price",
            "Device to shop": "Smartphone",
            "nternet connection used": "Mobile Data",
            "Recommendation to others": "No",
            "Rate of Satisfaction": 3,
            "Rate of availability of products": 3
        }
    },
    {
        "name": "Premium Shopper",
        "data": {
            "Age": "35-44",
            "Gender": "Female",
            "Monthly Income": ">1,000,000",
            "Region": "Lagos",
            "Frequency of Shopping": "Weekly",
            "Average spending": ">100,000",
            "Categories": "Fashion",
            "Means of Payment": "Credit Card",
            "Entrolled on Jumia Prime or any loyalty program": "Yes",
            "Frequency of shopping": "Often",
            "Reason for your purchase": "Quality",
            "Device to shop": "Smartphone",
            "nternet connection used": "Home Wi-Fi",
            "Recommendation to others": "Yes",
            "Rate of Satisfaction": 5,
            "Rate of availability of products": 5
        }
    }
]


def test_api():
    base_url = "http://localhost:5000/segment"

    for case in test_cases:
        print(f"\nTesting {case['name']}...")
        response = requests.post(
            base_url,
            json=case['data'],
            headers={'Content-Type': 'application/json'}
        )

        if response.status_code == 200:
            result = response.json()
            print(f"Result: Cluster {result['cluster']}")
            print(f"Profile: {result['cluster_profile']['name']}")
            print(f"Description: {result['cluster_profile']['description']}")
        else:
            print(f"Error: {response.status_code}")
            print(response.text)


if __name__ == '__main__':
    test_api()