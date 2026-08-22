from sqlalchemy import text, create_engine
from argon2 import PasswordHasher
from random import random
from time import time
from dotenv import get_key

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


def generateUserId() -> int:
    return int((random() + 100) * 100 + time())


def addCred(username: str, password: str) -> bool | str:
    try:
        ph = PasswordHasher()
        connection = create_engine(get_key(f"{BASE_DIR}./.env", "DATABASE")).connect()
        hashed_password = ph.hash(password)
        user_id = generateUserId()

        query = text(
            'INSERT INTO "USERS" VALUES(:user_id,:username, :password);',
        )
        connection.execute(
            query,
            {"user_id": user_id, "username": username, "password": hashed_password},
        )
        connection.commit()
        connection.close()
        return user_id
    except:
        return False
