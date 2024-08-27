from django.test import TestCase
import requests

url = "http://127.0.0.1:8000/api/projections_ppr/"

try:
    response = requests.get(url)
    response.raise_for_status()  # Check if the request was successful
    print(response.text[:500])  # Print the first 500 characters of the response
except requests.exceptions.RequestException as e:
    print(f"An error occurred: {e}")
# Create your tests here.
