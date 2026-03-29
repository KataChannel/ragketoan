import os
import glob

def generate_html_chunks(image_dir, output_dir, chunk_size=20):
    images = sorted(glob.glob(os.path.join(image_dir, "*.png")))
    num_images = len(images)
    num_chunks = (num_images + chunk_size - 1) // chunk_size

    for i in range(num_chunks):
        start = i * chunk_size
        end = min((i + 1) * chunk_size, num_images)
        chunk_images = images[start:end]
        
        chunk_file = os.path.join(output_dir, f"chunk_{i}.html")
        with open(chunk_file, 'w', encoding='utf-8') as f:
            f.write("<html><body><h1>Bank Statements Chunk {}</h1>\n".format(i))
            for img in chunk_images:
                img_name = os.path.basename(img)
                # Following the reference formatting
                f.write("<h2>{}</h2><img src=\"{}\" width=\"1000\" /><br/>\n".format(img_name, img))
            f.write("</body></html>\n")
        print(f"Generated {chunk_file}")

if __name__ == "__main__":
    IMAGE_DIR = "docs/nganhang/quetnganhang2/images"
    OUTPUT_DIR = "docs/nganhang/quetnganhang2/text-data"
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    generate_html_chunks(IMAGE_DIR, OUTPUT_DIR)
