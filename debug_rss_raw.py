import requests
import xml.etree.ElementTree as ET

url = "https://note.com/meraki_noen/rss"
try:
    response = requests.get(url)
    content = response.content.decode('utf-8')
    
    # print the first item block raw
    start = content.find('<item>')
    end = content.find('</item>') + 7
    print(content[start:end])

except Exception as e:
    print(f"Error: {e}")
