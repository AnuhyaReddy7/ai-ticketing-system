from openai import OpenAI
import json

import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("SECRET_KEY"))

def analyze_ticket(description: str) -> dict:
    prompt = f"""
Classify this IT support ticket into JSON format:

Ticket: "{description}"

Return ONLY JSON with:
category, severity, department, resolution_path

Rules:
- Server/DB issues → Critical → Engineering → Manual
- Access/Login → Low → IT → Auto-resolve
- Billing → Medium → Finance → Auto-resolve
- HR → Low → HR → Auto-resolve
"""

    response = client.chat.completions.create(
        model="gpt-5-mini",
        messages=[
            {"role": "system", "content": "You are an IT ticket classifier."},
            {"role": "user", "content": prompt}
        ]
    )

    content = response.choices[0].message.content

    try:
        return json.loads(content)
    except:
        return {
            "category": "Other",
            "severity": "Low",
            "department": "General",
            "resolution_path": "Manual"
        }