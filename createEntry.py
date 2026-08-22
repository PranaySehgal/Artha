import json
from sqlalchemy import text, create_engine
from dotenv import get_key
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
from rich.console import Console

console = Console()


def createEntry(userid: str, data: json) -> bool:

    conn = create_engine(get_key(f"{BASE_DIR}./.env", "DATABASE")).connect()
    check_dup = text(
        'SELECT * FROM "ENTRIES" WHERE user_id=:user and merchant=:merchant and date=:date and amount=:amount'
    )
    res = conn.execute(
        check_dup,
        {
            "user": str(userid),
            "date": data["date"],
            "merchant": data["merchant"],
            "amount": str(data["total"]),
        },
    ).fetchall()
    if not res:
        query = text(
            'INSERT INTO "ENTRIES"(user_id,date,merchant,amount,category) VALUES(:userid,:Date,:Merchant,:amount,:category);'
        )
        conn.execute(
            query,
            {
                "userid": str(userid),
                "Date": data["date"],
                "Merchant": data["merchant"],
                "amount": data["total"],
                "category": data["category"],
            },
        )
        conn.commit()
        conn.close()
    else:
        print("RECORD ALREADY EXISTS")
        return "dup"
    return True
