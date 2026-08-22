from PIL import Image, ImageOps, ImageFilter
import cv2
import numpy as np
from rich.console import Console
from rich.status import Status

console = Console()


def preProcessImage(img: Image) -> Image:
    image = img
    if img.mode != "L":
        image = ImageOps.grayscale(img)

    gray = np.array(image)

    # Only upscale — don't sharpen, blur, threshold, or equalize
    gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    return Image.fromarray(gray)
