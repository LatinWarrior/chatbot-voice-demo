# run project: $ uvicorn main:app
# run project with reload: $ uvicorn main:app --reload
# 
# create: python3 -m venv [some_env_name] (Mac)
# create: python -m venv [some_env_name] (Windows)
# activate: $ source [some_env_name]/bin/activate (Mac)
# activate: $ source [some_env_name]/Scripts/activate (Windows)
# deactivate: $ conda deactivate
# install python requirements: pip3 install -r requirements.txt

# Main imports
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from decouple import config
import openai
from mangum import Mangum

# Custom Function Imports
from functions.database import store_messages, reset_messages
from functions.openai_requests import convert_audio_to_text, get_chat_response
from functions.text_to_speach import convert_text_to_speech

# Initialize App
app = FastAPI()

# Create handler for AWS to hook up on to run our app.
handler = Mangum(app)

# CORS - Origins
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:4173",
    "http://localhost:4174",
    "http://localhost:3000",
    "http://localhost:4200",    
]

# CORS - Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Check health
@app.get("/health")
async def root():    
    return {"message": "healthy"}

# Reset messages
@app.get("/reset")
async def reset_conversation():   
    reset_messages()
    return {"message": "conversation was reset"}

# Get audio
@app.post('/post-audio/')
async def post_audio(file: UploadFile = File(...)):
    
    # # Get saved audio
    # audio_input = open('voice.mp3', 'rb')
    
    # Save file from front-end.
    with open(file.filename, 'wb') as buffer:
        buffer.write(file.file.read())
        
    audio_input = open(file.filename, 'rb')
    
    # Decode audio
    message_decoded = convert_audio_to_text(audio_input)
    
    # print(message_decoded)
    
    # Guard: Ensure message decoded
    if not message_decoded:
        return HTTPException(status_code = 400, detail = 'Failed to decode audio')
    
    # Get ChatGPT Response
    chat_response = get_chat_response(message_decoded)
    
    # Guard: Ensure message decoded
    if not chat_response:
        return HTTPException(status_code = 400, detail = 'Failed to get chat response')
    
    # Store messages
    store_messages(message_decoded, chat_response)
    
    # print(chat_response)
    
    # Convert chat response to audio
    audio_output = convert_text_to_speech(chat_response)
    
    # Guard: Text converted to speech
    if not audio_output:
        return HTTPException(status_code = 400, detail = 'Failed to get Eleven Labs audio response')
    
    # Create a generator that yields chunks of data.
    def iterate_file():
        yield audio_output
        
    # Return audio file
    # return StreamingResponse(iterate_file(), media_type = "audio/mpeg")
    return StreamingResponse(iterate_file(), media_type = "application/octet-stream")
    
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)