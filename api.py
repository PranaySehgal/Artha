from fastapi import FastAPI
from fastapi import FastAPI, UploadFile, File
import numpy as np
from PIL import Image
from io import BytesIO
from preprocessor import preProcessImage
from ocr import getImage
from parse import parseScript
from json import loads
from createEntry import createEntry
from addCred import addCred
from sqlalchemy import create_engine, text
from dotenv import get_key
from verifyCred import verifyCred
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(
    title="ARTHA API",
    description="Intelligent Expense & Receipt Management API",
    version="1.0.0",
)


@app.get("/")
def root():
    return {"name": "ARTHA", "status": "online", "version": "1.0.0"}


@app.post("/receipts/upload")
async def upload_receipt(file: UploadFile = File(...)):
    file_data = await file.read()
    image = Image.open(BytesIO(file_data))
    image = preProcessImage(image)
    text = getImage(image)
    result = parseScript(text)
    return loads(result)


@app.post("/receipts/createEntry")
def create_entry(user_id: str, data: dict):
    print("************************************************", data)
    response = createEntry(user_id, data)
    if response == "dup":
        return {"Response": "Duplicate Entry"}
    elif response and response != "dup":
        return {"Response": "Entry created successfully"}
    else:
        return {"Response": "Error!"}


@app.post("/createAccount")
def create_Account(user_name: str, password: str):
    response = addCred(user_name, password)
    if not response:
        return {"Response": "Error!"}
    else:
        return {"Response": response}


@app.post("/signInAccount")
def signIn(user_id: str, password: str):
    conn = create_engine(get_key(f"{BASE_DIR}/.env", "DATABASE")).connect()
    query = text('SELECT * FROM "USERS" WHERE user_id=:username')
    res = conn.execute(query, {"username": user_id}).fetchall()
    if not res:
        return {"Response": "User not found!"}
    hashedPass = res[0][2]
    response = verifyCred(user_id, password, hashedPass)
    if not response:
        return {"Response": "Incorrect Password!"}
    else:
        return {"Response": "Login Successful!"}
