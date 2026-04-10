import re
import os

filepath = '/Users/px-admin/Desktop/ANTIGRAVITY/reset-studio/docker-stack/reset-WebBuilder/server/htmlBuilder.js'
with open(filepath, 'r') as f:
    text = f.read()

# We need to find elements right after `<!-- BlockName -->`
# Specifically: <div class="w-full ..."> or <div ${anchorAttr} class="w-full ...">
# We want to remove `py-16` / `max-w-7xl` from those classNames, and inject ${inlineStyle}

import sys

def patch_block(block_name, text):
    pattern = r'(<!-- ' + block_name + r' -->\s*<div [^>]*?class="[^"]*w-full[^"]*")[^>]*>'
    
    def repl(m):
        full_tag = m.group(0)
        # remove py-16, py-8, py-20, etc
        new_tag = re.sub(r'\bpy-\d+\b', '', full_tag)
        new_tag = re.sub(r'\bmax-w-[\w-]+\b', '', new_tag)
        
        # If it doesn't already have an inlineStyle injected by us:
        if 'inlineStyle' not in new_tag and 'containerStyle' not in new_tag:
            # We want to add ${inlineStyle} at the end of the div tag before `>`
            # But wait, we also have to remove the customBg logic if it exists inside the tag
            new_tag = re.sub(r'\$\{customBg\}', '', new_tag)
            
            if block_name == 'NavbarBlock':
                # Navbar should use inlineStyle on outer container
                if new_tag.endswith('/>'):
                  new_tag = new_tag[:-2] + ' ${inlineStyle} />'
                else:
                  new_tag = new_tag[:-1] + ' ${inlineStyle}>'
            else:
                # Other blocks have an outer wrapper. We inject containerStyle on outer wrapper, 
                # but wait, previously we put it inline. Let's just use inlineStyle for full width elements.
                if new_tag.endswith('/>'):
                  new_tag = new_tag[:-2] + ' ${inlineStyle} />'
                else:
                  new_tag = new_tag[:-1] + ' ${inlineStyle}>'
        return new_tag

    return re.sub(pattern, repl, text, count=1)

blocks = [
    'NavbarBlock', 'HeroSection', 'TextBlock', 'ImageBlock', 'ButtonBlock', 
    'SplitBlock', 'FeaturesGridBlock', 'VideoBlock', 'AvatarGridBlock', 
    'CarouselBlock', 'LeadCaptureBlock', 'PricingBlock', 'FaqBlock', 'TestimonialBlock'
]

for b in blocks:
    text = patch_block(b, text)

# For TextBlock inner element if it exists:
text = re.sub(r'(<!-- TextBlock -->.*?<div.*?>\s*<div)(.*?class=".*?>)', r'\1\2', text, flags=re.DOTALL)


with open(filepath, 'w') as f:
    f.write(text)
    
print("Patched export blocks.")
