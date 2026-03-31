import os
import glob

def generate_html_chunks(image_dir, output_dir, chunk_size=20):
    images = sorted(glob.glob(os.path.join(image_dir, "*.png")))
    num_images = len(images)
    
    os.makedirs(output_dir, exist_ok=True)
    
    for i in range(0, num_images, chunk_size):
        chunk_num = i // chunk_size
        end_idx = min(i + chunk_size, num_images)
        chunk_images = images[i:end_idx]
        
        chunk_file = os.path.join(output_dir, f"chunk_{chunk_num}.html")
        
        with open(chunk_file, 'w', encoding='utf-8') as f:
            f.write(f"<html><body><h1>Bank Statements Chunk {chunk_num}</h1>\n")
            for img_path in chunk_images:
                filename = os.path.basename(img_path)
                # The src path should be relative or specific. In quetnganhang2 it was relative to project root?
                # Actually, quetnganhang2/text-data/chunk_0.html had:
                # src="docs/nganhang/quetnganhang2/images/..."
                # So it's relative from someone's perspective. I'll use the same pattern.
                rel_img_path = f"docs/nganhang/huyvu20232024/images/{filename}"
                f.write(f"<h2>{filename}</h2><img src=\"{rel_img_path}\" width=\"1000\" /><br/>\n")
            f.write("</body></html>\n")
        print(f"Generated {chunk_file}")

if __name__ == "__main__":
    IMAGE_DIR = "docs/nganhang/huyvu20232024/images"
    OUTPUT_DIR = "docs/nganhang/huyvu20232024/text-data"
    generate_html_chunks(IMAGE_DIR, OUTPUT_DIR)
