import os
with open('.env.local', 'r') as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            if k.strip() in ('GEMINI_API_KEY','GOOGLE_API_KEY','GOOGLE_DRIVE_API_KEY'):
                api_key = v.strip().strip('"')
                break

from google import genai
client = genai.Client(api_key=api_key)
models = list(client.models.list())
print(f"Total models: {len(models)}")
print()
print("Video / imagen / veo models:")
for m in models:
    if any(x in m.name.lower() for x in ['veo','video','imagen']):
        print(f"  {m.name}")
print()
print("All model names (first 40):")
for m in models[:40]:
    print(f"  {m.name}")
