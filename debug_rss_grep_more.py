import requests

url = "https://note.com/meraki_noen/rss"
try:
    response = requests.get(url)
    content = response.content.decode('utf-8')
    
    idx = 0
    while True:
        idx = content.find("thumbnail", idx)
        if idx == -1:
            break
        print(f"--- Occurrence at {idx} ---")
        # print surrounding 200 chars, replace newlines to see structure
        surrounding = content[max(0, idx-100):min(len(content), idx+200)].replace('\n', ' ')
        print(surrounding)
        idx += 1
        
except Exception as e:
    print(f"Error: {e}")
