import requests
import json

def test_external_api():
    base_url = "http://data.Incrementum.duckdns.org"
    print(f"Testing connection to: {base_url}")
    
    # Test /stocks endpoint
    try:
        print("Testing /stocks endpoint...")
        response = requests.get(f"{base_url}/stocks", timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        if response.status_code == 200:
            data = response.json()
            print(f"Response type: {type(data)}")
            print(f"Response keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
            if isinstance(data, dict) and 'stocks' in data:
                stocks = data['stocks']
                print(f"Number of stocks: {len(stocks)}")
                if len(stocks) > 0:
                    print(f"First stock: {stocks[0]}")
            else:
                print(f"Response data: {data[:500] if isinstance(data, str) else data}")
        else:
            print(f"Error response: {response.text}")
    except Exception as e:
        print(f"Error connecting to API: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_external_api()