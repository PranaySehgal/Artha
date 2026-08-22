from sqlalchemy import text, create_engine
from dotenv import get_key

from pathlib import Path
from rich.console import Console
from rich.status import Status

console = Console()
BASE_DIR = Path(__file__).resolve().parent


def information(user_id) -> dict:

    conn = create_engine(get_key(f"{BASE_DIR}./.env", "DATABASE")).connect()
    query = text('SELECT * FROM "ENTRIES" where user_id=:user_id;')
    res = conn.execute(query, {"user_id": user_id})
    return res.fetchall()
