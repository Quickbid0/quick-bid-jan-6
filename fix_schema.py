#!/usr/bin/env python3

with open('prisma/schema.prisma', 'r') as f:
    lines = f.readlines()

in_model = False
model_start = -1
output_lines = []

i = 0
while i < len(lines):
    line = lines[i]
    
    if line.strip().startswith('model '):
        in_model = True
        model_start = i
        output_lines.append(line)
    elif in_model and line.strip() == '}':
        # Check if model already has @@schema
        model_content = ''.join(lines[model_start:i])
        if '@@schema' not in model_content:
            output_lines.append('  @@schema("public")\n')
        output_lines.append(line)
        in_model = False
    else:
        output_lines.append(line)
    
    i += 1

with open('prisma/schema.prisma', 'w') as f:
    f.writelines(output_lines)

print("Added @@schema attributes to models and enums")
