import os
import docx

folder = "d:/Projects/ProjectMahabali"
output_file = "d:/Projects/ProjectMahabali/all_docs.txt"

with open(output_file, "w", encoding="utf-8") as out:
    for filename in sorted(os.listdir(folder)):
        if filename.endswith(".docx"):
            out.write(f"=== {filename} ===\n")
            doc = docx.Document(os.path.join(folder, filename))
            for para in doc.paragraphs:
                out.write(para.text + "\n")
            out.write("\n")
print("Done extracting text.")
