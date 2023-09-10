
from decouple import config

def get_openai_config():
    try: 
        # Retrieve Environment variables.
        organization = config('OPEN_AI_ORG')
        api_key = config('OPEN_AI_KEY')
        # Create dictionary to return the stuff.
        d = dict();
        d['organization'] = organization
        d['api_key'] = api_key
        return d
    except Exception as e:
        print(e)
        return