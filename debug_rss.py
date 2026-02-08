import requests
import xml.etree.ElementTree as ET

url = "https://note.com/meraki_noen/rss"
try:
    response = requests.get(url)
    # response.raise_for_status() # Note might return 403 for python user agent?
    
    # fake user agent
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
    response = requests.get(url, headers=headers)
    
    root = ET.fromstring(response.content)
    
    # Namespace map
    namespaces = {
        'content': 'http://purl.org/rss/1.0/modules/content/',
        'media': 'http://search.yahoo.com/mrss/'
    }

    for item in root.findall('./channel/item')[:1]:
        title = item.find('title').text
        print(f"Title: {title}")
        
        # Check content:encoded
        content = item.find('content:encoded', namespaces)
        if content is not None:
            print("Content Encoded found.")
            # print first 500 chars to see if img tag exists
            print(f"Content Start: {content.text[:500]}")
            if "<img" in content.text:
                print("Image tag found in content.")
                # extract src
                import re
                match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', content.text)
                if match:
                    print(f"Image Src: {match.group(1)}")
                
                # Check data-src
                match_data = re.search(r'data-src=["\']([^"\']+)["\']', content.text)
                if match_data:
                    print(f"Data Src: {match_data.group(1)}")
        else:
            print("Content Encoded: None")
            
except Exception as e:
    print(f"Error: {e}")
