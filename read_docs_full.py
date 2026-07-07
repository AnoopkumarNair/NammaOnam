import os
import docx
from docx.oxml.ns import qn

folder = r"d:\Projects\ProjectMahabali"
output_file = r"d:\Projects\ProjectMahabali\all_docs_full.txt"

def extract_cell_text(cell):
    return " | ".join(p.text.strip() for p in cell.paragraphs if p.text.strip())

def extract_table(table, indent="  "):
    lines = []
    for i, row in enumerate(table.rows):
        cells = [extract_cell_text(c) for c in row.cells]
        # deduplicate merged cells
        deduped = []
        prev = None
        for c in cells:
            if c != prev:
                deduped.append(c)
            prev = c
        lines.append(indent + " || ".join(deduped))
    return "\n".join(lines)

def extract_doc(path):
    doc = docx.Document(path)
    lines = []
    
    # We iterate body children in order to preserve paragraph/table interleaving
    body = doc.element.body
    for child in body.iterchildren():
        tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
        
        if tag == 'p':
            # It's a paragraph
            from docx.text.paragraph import Paragraph
            para = Paragraph(child, doc)
            text = para.text.strip()
            style = para.style.name if para.style else ''
            if text:
                if 'Heading 1' in style:
                    lines.append(f"\n## {text}")
                elif 'Heading 2' in style:
                    lines.append(f"\n### {text}")
                elif 'Heading 3' in style:
                    lines.append(f"\n#### {text}")
                elif para.style and 'List' in style:
                    lines.append(f"  - {text}")
                else:
                    lines.append(text)
        
        elif tag == 'tbl':
            from docx.table import Table
            table = Table(child, doc)
            lines.append("\n[TABLE]")
            lines.append(extract_table(table))
            lines.append("[/TABLE]")
    
    return "\n".join(lines)

with open(output_file, "w", encoding="utf-8") as out:
    for filename in sorted(os.listdir(folder)):
        if filename.endswith(".docx"):
            filepath = os.path.join(folder, filename)
            out.write(f"\n\n{'='*80}\n")
            out.write(f"FILE: {filename}\n")
            out.write(f"{'='*80}\n\n")
            try:
                content = extract_doc(filepath)
                out.write(content)
            except Exception as e:
                out.write(f"ERROR reading file: {e}\n")

print(f"Done. Output written to {output_file}")
