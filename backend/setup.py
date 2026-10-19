from ollama import chat

def explain_crop(image_path: str, confidence: float, bbox: tuple[int, int, int, int]) -> str:
    x1, y1, x2, y2 = bbox

    response = chat(
        model="medgemma:4b",
        messages=[{
            "role": "user",
            "content": f"""
Describe only visible radiographic features in this bone X-ray crop.
The separate detector reported confidence {confidence:.1%} and bounding box
(x1={x1}, y1={y1}, x2={x2}, y2={y2}).

Discuss lesion appearance and visible margins, cortical involvement, and
periosteal reaction only where the image supports it. If a feature is unclear
or outside the crop, say so. Do not diagnose, infer malignancy from the
detector score, or recommend treatment. Return a short, structured explanation.
""".strip(),
            "images": [C:\Users\kabir\Desktop\BoneCancer_share.jpg],
        }],
        stream=False,
    )
    return response.message.content