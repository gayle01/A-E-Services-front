import re

file_path = r'c:\Users\hp\Desktop\buildplan\buildplan-frontend\artifacts\build-planner\src\pages\estimate.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Check for duplicate closing tags
lines = content.split('\n')
for i, line in enumerate(lines, 1):
    # Count opening and closing tags
    open_tags = line.count('<')
    close_tags = line.count('>')
    if open_tags > 0 and close_tags > 0 and abs(open_tags - close_tags) > 2:
        print(f"Line {i}: Possible imbalance - {open_tags} open, {close_tags} close")
        print(f"  {line.strip()}")
    
    # Check for duplicate FormField or FormItem closing
    if line.count('</FormField>') > 1 or line.count('</FormItem>') > 1:
        print(f"Line {i}: Duplicate closing tags")
        print(f"  {line.strip()}")

# Check for common patterns that might be broken
patterns = [
    (r'/\s*>\s*/>', 'Self-closing tag issue'),
    (r'/>\s*</', 'Adjacent tags without wrapper'),
]

for pattern, desc in patterns:
    matches = re.finditer(pattern, content)
    for match in matches:
        line_num = content[:match.start()].count('\n') + 1
        print(f"Line {line_num}: {desc}")
        print(f"  {content[max(0, match.start()-50):match.end()+50]}")

print("Check complete")
