import pytesseract
from PIL import Image
from pathlib import Path

try:
    from .preprocessor import preProcessImage
except:
    from preprocessor import preProcessImage
from rich.console import Console
from rich.status import Status

console = Console()


def getImage(imgPath: Path | Image) -> str:
    img = None
    try:
        Path(imgPath)
        img = Image.open(imgPath)
    except:
        img = imgPath
    img = preProcessImage(img)

    text = pytesseract.image_to_string(img, config="--psm 11")

    return text
