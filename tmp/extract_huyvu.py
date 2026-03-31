import os
import json
import base64
import glob
import time
import google.generativeai as genai

# Load API Key from .env
def get_api_key():
    with open(".env", "r") as f:
        for line in f:
            if line.startswith("GOOGLE_API_KEY="):
                return line.split("=")[1].strip()
    return None

API_KEY = get_api_key()
if not API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in .env")

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

def extract_transactions(image_paths):
    parts = []
    # System instruct / prompt
    prompt = """
    Extract all transactions from these bank statement images.
    Return ONLY a JSON array of objects with these fields:
    - filename: name of the image file
    - date: transaction date (DD/MM/YYYY)
    - description: transaction description
    - debit: amount debited (numeric, 0 if none)
    - credit: amount credited (numeric, 0 if none)
    - balance: account balance (numeric)

    If the description is split across lines, combine it into one string.
    Ensure all currency values are numbers without commas.
    If you see some account information or overhead, ignore it, focuses only on transaction rows.
    """
    parts.append(prompt)
    
    for path in image_paths:
        with open(path, "rb") as f:
            image_data = f.read()
            parts.append({
                "mime_type": "image/png",
                "data": image_data
            })
            parts.append(f"\nImage Filename: {os.path.basename(path)}")
            
    try:
        response = model.generate_content(parts)
        text = response.text
        # Clean potential markdown JSON fences
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        
        # Sometimes there's some extra text, just try to find [ and ]
        start = text.find('[')
        end = text.rfind(']') + 1
        if start != -1 and end != 0:
            text = text[start:end]
            
        return json.loads(text)
    except Exception as e:
        print(f"Error extracting from {image_paths}: {e}")
        return []

def process_all(image_dir, output_dir, chunk_size=3):
    images = sorted(glob.glob(os.path.join(image_dir, "*.png")))
    num_images = len(images)
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Process in chunks of 3 images per JSON to stay within some limits
    for i in range(0, num_images, chunk_size):
        end_idx = min(i + chunk_size, num_images)
        chunk_images = images[i:end_idx]
        
        # Determine output filename: transactions_batch_manual_N.json
        chunk_num = i // chunk_size + 1
        outfile = os.path.join(output_dir, f"transactions_batch_manual_{chunk_num}.json")
        
        if os.path.exists(outfile):
            print(f"Skipping {outfile}, already exists.")
            continue

        print(f"Processing images {i} to {end_idx-1} -> {outfile}")
        transactions = extract_transactions(chunk_images)
        
        if transactions:
            with open(outfile, 'w', encoding='utf-8') as f:
                json.dump(transactions, f, ensure_ascii=False, indent=2)
            print(f"Successfully saved {outfile}")
        else:
            print(f"Failed to extract for {outfile}")
            
        time.sleep(2)

if __name__ == "__main__":
    IMAGE_DIR = "docs/nganhang/huyvu20232024/images"
    OUTPUT_DIR = "docs/nganhang/huyvu20232024/text-data"
    process_all(IMAGE_DIR, OUTPUT_DIR)
