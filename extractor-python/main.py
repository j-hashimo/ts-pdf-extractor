# extractor-python/main.py
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from extract import extract_highlights_and_images
import uvicorn
import os
import tempfile

app = FastAPI()

@app.post("/extract")
async def extract(file: UploadFile = File(...)):
    contents = await file.read()
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        highlights, images = extract_highlights_and_images(tmp_path)
        os.unlink(tmp_path)
        return JSONResponse(content={"highlights": highlights, "images": images})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
