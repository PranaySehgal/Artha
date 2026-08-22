import json
import requests


def prompt(ocr_text: str) -> json:
    req = requests.post(
        "http://127.0.0.1:11434/api/chat",
        json={
            "stream": False,
            "format": "json",
            "options": {"temperature": 0},
            "model": "qwen2.5-coder:1.5b",
            "messages": [{"role": "user", "content": ocr_text}],
            "stream": False,
            "format": "json",
        },
    )
    message = req.json()["message"]["content"]
    return message
