import re
import os

filepath = '/Users/px-admin/Desktop/ANTIGRAVITY/reset-studio/docker-stack/reset-WebBuilder/server/htmlBuilder.js'

with open(filepath, 'r') as f:
    text = f.read()

text = re.sub(
    r'class="w-full h-full object-cover rounded-theme shadow-xl max-h-\[500px\]"',
    r'class="w-full h-auto object-cover rounded-theme shadow-xl"',
    text
)

with open(filepath, 'w') as f:
    f.write(text)
