file_path = r'c:\Users\hp\Desktop\buildplan\buildplan-frontend\artifacts\build-planner\src\pages\estimate.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Count opening and closing tags for major components
tags_to_check = [
    'FormField',
    'FormItem',
    'FormControl',
    'FormLabel',
    'FormMessage',
    'Select',
    'SelectContent',
    'SelectItem',
    'SelectTrigger',
    'SelectValue',
    'Card',
    'CardContent',
    'CardHeader',
    'CardTitle',
    'div',
]

for tag in tags_to_check:
    open_count = content.count(f'<{tag}')
    close_count = content.count(f'</{tag}>')
    if open_count != close_count:
        print(f"{tag}: {open_count} opening, {close_count} closing - MISMATCH!")
    else:
        print(f"{tag}: {open_count} opening, {close_count} closing - OK")

# Check for unclosed render functions
render_open = content.count('render={({ field }) => (')
render_close = content.count(')} />')
print(f"\nRender functions: {render_open} opening, {render_close} closing")

# Check for unclosed FormField
formfield_open = content.count('<FormField')
formfield_close = content.count('</FormField>')
print(f"FormField: {formfield_open} opening, {formfield_close} closing")
