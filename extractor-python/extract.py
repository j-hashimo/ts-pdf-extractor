# extractor-python/extract.py

import fitz
from PIL import Image
import tempfile
import io
import base64

def extract_highlights_and_images(file_path):
    doc = fitz.open(file_path)

    highlights = []
    for page in doc:
        for annot in page.annots() or []:
            if annot.type[0] == 8:
                rect = annot.rect
                words = page.get_textbox(rect)
                if words:
                    highlights.append(words.strip())

    image_list = []
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        images = page.get_images(full=True)

        for img in images:
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]

            # Convert to base64 string
            image = Image.open(io.BytesIO(image_bytes))
            buffered = io.BytesIO()
            image.save(buffered, format="PNG")
            img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
            image_list.append(img_base64)

    return highlights, image_list
