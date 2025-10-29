#!/usr/bin/env python3
"""
Ultimate emoji removal - catches ALL Unicode emojis including variation selectors
"""

import os
import re

PROJECT_ROOT = '/home/injinia47/Desktop/PROJO/Projo'
EXCLUDED_DIRS = ['node_modules', '.git', 'build', 'dist', '.expo']

# Comprehensive emoji removal patterns
EMOJI_REPLACEMENTS = {
    '✅': '[OK]',
    '❌': '[FAIL]',
    '⚠️': '[WARNING]',
    '⚠': '[WARNING]',
    '🔹': '[Added]',
    '🔸': '[Revised]',
    '📝': '[NOTE]',
    '📚': '[DOCS]',
    '📦': '[PACKAGE]',
    '📊': '[METRICS]',
    '📄': '[DOC]',
    '📋': '[LIST]',
    '🎯': '[TARGET]',
    '🚀': '[LAUNCH]',
    '✓': 'OK',
    '✗': 'FAIL',
    '×': 'x',
    '○': 'o',
    '•': '*',
    '⏱️': '[TIMER]',
    '⏱': '[TIMER]',
    '⌨️': '',
    '☁️': '',
    '⚡️': '',
    '🔧': '',
    '🎉': '[SUCCESS]',
    '️': '',  # Variation selector
}

# Unicode ranges for emojis
EMOJI_PATTERN = re.compile(
    "["
    "\U0001F600-\U0001F64F"  # emoticons
    "\U0001F300-\U0001F5FF"  # symbols & pictographs
    "\U0001F680-\U0001F6FF"  # transport & map symbols
    "\U0001F1E0-\U0001F1FF"  # flags
    "\U00002600-\U000026FF"  # miscellaneous symbols
    "\U00002700-\U000027BF"  # dingbats
    "\U0001F900-\U0001F9FF"  # Supplemental Symbols
    "\U0001FA00-\U0001FA6F"  # Extended Symbols
    "\U0000FE0F"              # variation selector-16
    "]+",
    flags=re.UNICODE
)

stats = {'processed': 0, 'modified': 0, 'removed': 0}

def clean_content(content):
    """Remove all emojis from content"""
    original_length = len(content)
    
    # First pass: replace known emojis with text
    for emoji, replacement in EMOJI_REPLACEMENTS.items():
        content = content.replace(emoji, replacement)
    
    # Second pass: remove any remaining emoji characters
    content = EMOJI_PATTERN.sub('', content)
    
    # Clean up multiple spaces
    content = re.sub(r'  +', ' ', content)
    content = re.sub(r'##  ', '## ', content)  # Fix markdown headers
    
    removed = original_length - len(content)
    return content, removed

def process_file(filepath):
    """Process a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            original = f.read()
        
        cleaned, removed = clean_content(original)
        
        if removed > 0 or cleaned != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(cleaned)
            stats['modified'] += 1
            stats['removed'] += removed
            rel_path = filepath.replace(PROJECT_ROOT, '')
            print(f"  Cleaned: {rel_path}")
        
        stats['processed'] += 1
        
    except Exception as e:
        print(f"  Error processing {filepath}: {e}")

def scan_project():
    """Scan entire project"""
    extensions = ['.md', '.js', '.jsx', '.ts', '.tsx', '.sh', '.bat', '.json']
    
    for root, dirs, files in os.walk(PROJECT_ROOT):
        # Filter out excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
        
        for filename in files:
            if any(filename.endswith(ext) for ext in extensions):
                filepath = os.path.join(root, filename)
                process_file(filepath)

def main():
    print('=' * 70)
    print('ULTIMATE EMOJI REMOVAL - Final Pass')
    print('=' * 70)
    print()
    
    scan_project()
    
    print()
    print('=' * 70)
    print('COMPLETION SUMMARY')
    print('=' * 70)
    print(f'Files Processed: {stats["processed"]}')
    print(f'Files Modified: {stats["modified"]}')
    print(f'Characters Removed: {stats["removed"]}')
    print('=' * 70)
    print()
    
    if stats['modified'] == 0:
        print('[SUCCESS] All emojis have been removed from the project!')
        print('The codebase is now professional and emoji-free.')
    else:
        print(f'Cleaned {stats["modified"]} files successfully.')

if __name__ == '__main__':
    main()
