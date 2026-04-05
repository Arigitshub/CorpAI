import base64
import re
from pathlib import Path

def mermaid_to_ink(code):
    # Standard base64 encoding (not pako, just simple base64)
    coded_bytes = base64.b64encode(code.encode('utf-8'))
    coded_str = coded_bytes.decode('utf-8')
    return f"https://mermaid.ink/svg/{coded_str}"

def process_file(file_path):
    content = file_path.read_text(encoding='utf-8')
    
    # regex to find mermaid blocks
    mermaid_pattern = re.compile(r'```mermaid\n(.*?)\n```', re.DOTALL)
    
    def replacer(match):
        code = match.group(1).strip()
        img_url = mermaid_to_ink(code)
        
        return f'![Chart]({img_url})\n\n<details>\n<summary>View Source</summary>\n\n```mermaid\n{code}\n```\n\n</details>'

    new_content = mermaid_pattern.sub(replacer, content)
    file_path.write_text(new_content, encoding='utf-8')
    return True

if __name__ == "__main__":
    path = Path(r"d:\Ari\CorpAI\spec\diagrams\org-chart.md")
    process_file(path)
    print("Optimization Complete: Mermaid diagrams converted to static SVG images.")
