import base64
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


def capture_line_scan(img: np.ndarray, index: int) -> np.ndarray:
    """Simulated line scan: return a single row as a 1-pixel-tall image."""
    return img[index:index + 1, 0:line_width]


def encode_line_png_base64(line: np.ndarray) -> str:
    success, buffer = cv2.imencode(".png", line)
    if not success:
        raise RuntimeError("Failed to encode line image")
    return base64.b64encode(buffer).decode("utf-8")


def next_line_base64() -> tuple[str, int]:
    """Return next line as base64 PNG and the updated line index."""
    global current_line_index

    line = capture_line_scan(gray_image, current_line_index)
    current_line_index += 1
    if current_line_index >= img_height:
        current_line_index = 0

    return encode_line_png_base64(line), current_line_index
