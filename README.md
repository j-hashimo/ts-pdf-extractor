to run locally:

cd to server: npm run dev

cd to extractor-python folder: 
.\venv\Scripts\activate 
or for python 3.11:
.\venv311\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000


cd client: npm run dev