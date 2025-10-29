#!/usr/bin/env python3
"""
Final emoji cleanup script using Python for better Unicode handling
"""

import os
import re
import json
from pathlib import Path

PROJECT_ROOT = '/home/injinia47/Desktop/PROJO/Projo'
EXCLUDED_DIRS = ['node_modules', '.git', 'build', 'dist']

# Comprehensive emoji patterns
EMOJI_PATTERNS = [
    # Common emojis used in project
    (r'🚀', '[LAUNCH]'),
    (r'✅', '[OK]'),
    (r'❌', '[FAIL]'),
    (r'⚠️', '[WARNING]'),
    (r'🔹', '[Added]'),
    (r'🔸', '[Revised]'),
    (r'📝', '[NOTE]'),
    (r'📚', '[DOCS]'),
    (r'📦', '[PACKAGE]'),
    (r'📊', '[METRICS]'),
    (r'📄', '[DOCUMENT]'),
    (r'📋', '[CHECKLIST]'),
    (r'🎯', '[TARGET]'),
    (r'📏', '[SIZE]'),
    (r'⏱️', '[TIMER]'),
    (r'⌨️', '[KEYBOARD]'),
    (r'☁️', ''),
    (r'⚡️', ''),
    (r'🔧', ''),
    (r'✓', 'OK'),
    (r'✗', 'FAIL'),
    (r'×', 'x'),
    (r'○', 'o'),
    (r'•', '*'),
    
    # Unicode emoji ranges (remove any remaining)
    (r'[\U0001F600-\U0001F64F]', ''),  # Emoticons
    (r'[\U0001F300-\U0001F5FF]', ''),  # Misc Symbols
    (r'[\U0001F680-\U0001F6FF]', ''),  # Transport
    (r'[\U0001F1E0-\U0001F1FF]', ''),  # Flags
    (r'[\U00002600-\U000026FF]', ''),  # Misc symbols
    (r'[\U00002700-\U000027BF]', ''),  # Dingbats
    (r'[\U0001F900-\U0001F9FF]', ''),  # Supplemental Symbols
    (r'[\U0001FA00-\U0001FA6F]', ''),  # Extended Symbols
]

stats = {
    'files_processed': 0,
    'files_modified': 0,
    'emojis_removed': 0,
    'modified_files': []
}

def should_process_file(filepath):
    """Check if file should be processed"""
    extensions = ['.sh', '.bat', '.md', '.js', '.jsx', '.ts', '.tsx']
    return any(filepath.endswith(ext) for ext in extensions)

def remove_emojis_from_content(content):
    """Remove emojis from content"""
    modified = content
    count = 0
    
    for pattern, replacement in EMOJI_PATTERNS:
        matches = len(re.findall(pattern, modified))
        if matches > 0:
            modified = re.sub(pattern, replacement, modified)
            count += matches
    
    return modified, count

def process_file(filepath):
    """Process a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        modified_content, emoji_count = remove_emojis_from_content(content)
        
        if emoji_count > 0:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(modified_content)
            
            stats['files_modified'] += 1
            stats['emojis_removed'] += emoji_count
            stats['modified_files'].append({
                'path': str(filepath).replace(PROJECT_ROOT, ''),
                'emojis_removed': emoji_count
            })
            print(f"  [{emoji_count} emojis] {Path(filepath).name}")
        
        stats['files_processed'] += 1
        
    except Exception as e:
        print(f"  [ERROR] {Path(filepath).name}: {e}")

def scan_directory(directory):
    """Recursively scan directory"""
    for root, dirs, files in os.walk(directory):
        # Filter out excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
        
        for filename in files:
            filepath = os.path.join(root, filename)
            if should_process_file(filepath):
                process_file(filepath)

def main():
    print('=' * 60)
    print('FINAL EMOJI CLEANUP - Python Script')
    print('=' * 60)
    print(f'Project Root: {PROJECT_ROOT}')
    print('Target: Shell scripts and remaining files with emojis')
    print('=' * 60)
    print()
    
    scan_directory(PROJECT_ROOT)
    
    print()
    print('=' * 60)
    print('FINAL CLEANUP COMPLETE')
    print('=' * 60)
    print(f'Files Processed: {stats["files_processed"]}')
    print(f'Files Modified: {stats["files_modified"]}')
    print(f'Total Emojis Removed: {stats["emojis_removed"]}')
    print('=' * 60)
    
    # Save report
    report_path = os.path.join(PROJECT_ROOT, 'final-emoji-cleanup-report.json')
    with open(report_path, 'w') as f:
        json.dump(stats, f, indent=2)
    
    print(f'\nReport saved to: final-emoji-cleanup-report.json')
    
    if stats['modified_files']:
        print('\nFiles modified:')
        for file_info in sorted(stats['modified_files'], 
                               key=lambda x: x['emojis_removed'], 
                               reverse=True)[:10]:
            print(f"  - {file_info['path']} ({file_info['emojis_removed']} emojis)")

if __name__ == '__main__':
    main()
