import os
from pathlib import Path

import cv2
import numpy as np

MAX_WIDTH = 8192
MAX_LINES = 1200
MAX_HEIGHT = 8192

BASE_DIR = Path(__file__).resolve().parents[2]
DEFAULT_IMAGE_PATH = BASE_DIR / "nature-landscape-with-black-sand-beach.jpg"

# Line scan camera state
current_line_index = 0


def _load_image():
    image_path = Path(os.getenv("LINE_SCAN_IMAGE_PATH", str(DEFAULT_IMAGE_PATH)))

    if image_path.exists():
        img_bgr = cv2.imread(str(image_path))
        if img_bgr is not None:
            img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
            if img_gray.shape[1] > MAX_WIDTH:
                img_gray = img_gray[:, :MAX_WIDTH]
            return img_gray

    # Fallback dummy image
    return np.zeros((MAX_LINES, MAX_WIDTH), dtype=np.uint8)


gray_image = _load_image()
line_width = int(gray_image.shape[1])
img_height = int(gray_image.shape[0])


def next_line_raw() -> tuple[bytes, int]:
    """Return next line as raw grayscale bytes and the updated line index."""
    global current_line_index

    line = gray_image[current_line_index, 0:line_width]
    current_line_index += 1
    if current_line_index >= img_height:
        current_line_index = 0

    return line.tobytes(), current_line_index
