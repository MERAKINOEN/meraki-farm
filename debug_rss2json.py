import requests
import json

rss_url = "https://note.com/meraki_noen/rss"
api_url = f"https://api.rss2json.com/v1/api.json?rss_url={rss_url}"

try:
    response = requests.get(api_url)
    data = response.json()
    
    if data['status'] == 'ok':
        for item in data['items']:
            print(f"Title: {item['title']}")
            print(f"Thumbnail: {item.get('thumbnail')}")
            print(f"Enclosure: {item.get('enclosure')}")
            print(f"Description Image: {'<img' in item.get('description', '')}")
            print(f"Content Image: {'<img' in item.get('content', '')}")
            print("-" * 20)
    else:
        print("RSS2JSON returned error status")
        
except Exception as e:
    print(f"Error: {e}")
