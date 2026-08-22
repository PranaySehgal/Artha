import json
import requests

try:
    from .llm import prompt
except:
    from llm import prompt
from rich.console import Console
from rich.status import Status
from pathlib import Path

console = Console()


def parseScript(text: str) -> str:
    ocr_text = None
    with open(f"{Path(__file__).resolve().parent}/model_prompt.txt", "r") as f:
        ocr_text = f.read()
    ocr_text += text
    x = prompt(ocr_text)
    return x
