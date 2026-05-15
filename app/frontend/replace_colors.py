import os

def replace_colors(directory):
    count = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.ts', '.css', '.svg')):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    original_content = content
                    content = content.replace('#0F5238', '#66B018')
                    content = content.replace('#0f5238', '#66B018')
                    content = content.replace('#2D6A4F', '#66B018')
                    content = content.replace('#2d6a4f', '#66B018')
                    
                    if content != original_content:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(content)
                        count += 1
                except Exception as e:
                    print(f"Error reading {filepath}: {e}")
    print(f"Replaced colors in {count} files.")

if __name__ == "__main__":
    replace_colors("c:/Users/MIchael/Documents/CMSC 127 FINAL PROJECT/sureplus-app/app/frontend/src")
