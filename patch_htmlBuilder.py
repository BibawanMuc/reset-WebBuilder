import re
import os

filepath = '/Users/px-admin/Desktop/ANTIGRAVITY/reset-studio/docker-stack/reset-WebBuilder/server/htmlBuilder.js'

with open(filepath, 'r') as f:
    content = f.read()

# For each case, we want to inject pt, pb, mw extraction and style attributes.
# Since the cases return literal template strings, we can look for `return \`\n        <!-- BlockName -->` or similar.
# Wait, a universal approach might be to just add pt, pb, mw at the start of block rendering.
# In `function renderBlockToHtml(block, project) { \n  const props = block.props || {};`

def repl_func(match):
    return match.group(0) + """
  const pt = props.paddingTop !== undefined ? props.paddingTop : 4;
  const pb = props.paddingBottom !== undefined ? props.paddingBottom : 4;
  const mw = props.maxWidth !== undefined ? props.maxWidth : 100;
  const styleObj = (props.bgType === 'custom' && props.bgColor) ? `background-color: ${escapeHtml(props.bgColor)};` : '';
  const inlineStyle = `style="${styleObj} padding-top: ${pt}rem; padding-bottom: ${pb}rem; max-width: ${mw}%;"`;
  const containerStyle = `style="padding-top: ${pt}rem; padding-bottom: ${pb}rem; max-width: ${mw}vw; margin: 0 auto;"`;
"""

content = re.sub(r'const props = block\.props \|\| \{\};', repl_func, content)

# Now, across all cases, we find `<div ${anchorAttr} class="w-full py-16 ..."` 
# or `<div class="w-full py-16 ..."` and replace it with `<div ${anchorAttr} class="w-full ..." ${inlineStyle}>`
# Since htmlBuilder is mostly static strings for classes, we can run a regex over `.replace('py-16', '')`
# on the exact return templates.

# This is a bit complex in python without a proper AST parser for JS.

with open(filepath, 'w') as f:
    f.write(content)
