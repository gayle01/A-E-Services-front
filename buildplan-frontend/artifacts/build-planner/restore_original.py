# This script will help identify the specific broken section
file_path = r'c:\Users\hp\Desktop\buildplan\buildplan-frontend\artifacts\build-planner\src\pages\estimate.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Print lines around the error location (1147)
for i in range(1140, min(1170, len(lines))):
    print(f"{i+1}: {lines[i]}", end='')
