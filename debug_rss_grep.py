import requests

url = "https://note.com/meraki_noen/rss"
try:
    response = requests.get(url)
    content = response.content.decode('utf-8')
    
    if "thumbnail" in content:
        print("Thumbnail tag FOUND in XML")
        # print context
        index = content.find("thumbnail")
        print(content[index-50:index+150])
    else:
        print("Thumbnail tag NOT FOUND in XML")
        
except Exception as e:
    print(f"Error: {e}")
