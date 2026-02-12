import requests
import json
import time

note_id = "meraki_noen"
rss_url = f"https://note.com/{note_id}/rss"

print(f"Testing RSS fetch for: {rss_url}")
print("-" * 30)

# 1. Testing allorigins.win (Current method)
print("\n[1] Testing allorigins.win...")
try:
    proxy_url = f"https://api.allorigins.win/get?url={requests.utils.quote(rss_url)}"
    response = requests.get(proxy_url, timeout=10)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        content_length = len(data.get('contents', ''))
        print(f"Content Length: {content_length}")
        if content_length > 0:
            print("Snippet:", data.get('contents', '')[:100])
        else:
            print("Warning: Empty content received from proxy.")
    else:
        print("Error: Proxy returned non-200 status.")
except Exception as e:
    print(f"Error testing allorigins: {e}")

# 2. Testing rss2json.com (Alternative method)
print("\n[2] Testing rss2json.com...")
try:
    # rss2json api endpoint
    api_url = f"https://api.rss2json.com/v1/api.json?rss_url={requests.utils.quote(rss_url)}"
    response = requests.get(api_url, timeout=10)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        status = data.get('status')
        print(f"API Status: {status}")
        
        if status == 'ok':
            items = data.get('items', [])
            print(f"Items found: {len(items)}")
            if len(items) > 0:
                print("First item title:", items[0].get('title'))
        else:
            print("Message:", data.get('message'))
    else:
        print("Error: API returned non-200 status.")

except Exception as e:
    print(f"Error testing rss2json: {e}")
