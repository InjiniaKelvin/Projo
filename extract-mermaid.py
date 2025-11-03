#!/usr/bin/env python3
"""
Mermaid Diagram Extractor and Markdown Processor

This script extracts Mermaid diagrams from a Markdown file,
saves them as separate .mmd files, and creates a modified
Markdown file with image references instead of code blocks.

Author: Eng. Kelvin Mwania
Date: November 3, 2025
"""

import re
import os
import sys
import argparse
from pathlib import Path

def extract_mermaid_diagrams(markdown_file, output_dir, image_dir):
    """
    Extract Mermaid diagrams from markdown file
    
    Args:
        markdown_file: Path to the input markdown file
        output_dir: Directory to save extracted .mmd files
        image_dir: Directory name for images in markdown references
    
    Returns:
        tuple: (number of diagrams extracted, modified markdown content)
    """
    print(f"Reading markdown file: {markdown_file}")
    
    try:
        with open(markdown_file, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: File not found: {markdown_file}")
        sys.exit(1)
    except Exception as e:
        print(f"Error reading file: {e}")
        sys.exit(1)
    
    # Find all mermaid code blocks
    mermaid_pattern = r'```mermaid\s*(.*?)```'
    mermaid_blocks = re.findall(mermaid_pattern, content, re.DOTALL)
    
    diagram_count = len(mermaid_blocks)
    print(f"Found {diagram_count} Mermaid diagram(s)")
    
    if diagram_count == 0:
        print("Warning: No Mermaid diagrams found in the document")
        return 0, content
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    print(f"Output directory: {output_dir}")
    
    # Save each mermaid block to a separate file
    for i, block in enumerate(mermaid_blocks, 1):
        filename = os.path.join(output_dir, f"diagram_{i}.mmd")
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(block.strip())
            print(f"  ✓ Saved diagram {i} to {filename}")
        except Exception as e:
            print(f"  ✗ Error saving diagram {i}: {e}")
    
    # Create a modified markdown file with image placeholders
    modified_content = content
    
    for i in range(diagram_count):
        # Get the diagram title if there's a heading before the diagram
        # This is a simple approach - looks for the nearest heading
        
        # Replace mermaid block with image reference
        image_path = f"{image_dir}/diagram_{i+1}.png"
        image_markdown = f"\n\n![Diagram {i+1}]({image_path})\n\n"
        
        # Replace first occurrence
        modified_content = re.sub(
            r'```mermaid\s*.*?```',
            image_markdown,
            modified_content,
            count=1,
            flags=re.DOTALL
        )
    
    print(f"✓ Created modified markdown with {diagram_count} image references")
    
    return diagram_count, modified_content


def save_modified_markdown(content, output_file):
    """
    Save the modified markdown content to a file
    
    Args:
        content: Modified markdown content
        output_file: Path to save the modified markdown
    """
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Saved modified markdown to: {output_file}")
    except Exception as e:
        print(f"✗ Error saving modified markdown: {e}")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description='Extract Mermaid diagrams from Markdown and prepare for PDF conversion'
    )
    parser.add_argument(
        'markdown_file',
        help='Input markdown file path'
    )
    parser.add_argument(
        '--output-dir',
        default='./pdf-export-temp/mermaid-images',
        help='Directory to save extracted .mmd files (default: ./pdf-export-temp/mermaid-images)'
    )
    parser.add_argument(
        '--modified-output',
        default='./pdf-export-temp/modified_documentation.md',
        help='Path for modified markdown file (default: ./pdf-export-temp/modified_documentation.md)'
    )
    parser.add_argument(
        '--image-dir',
        default='./pdf-export-temp/mermaid-images',
        help='Directory path to use in image references (default: ./pdf-export-temp/mermaid-images)'
    )
    
    args = parser.parse_args()
    
    # Validate input file
    if not os.path.isfile(args.markdown_file):
        print(f"Error: Input file does not exist: {args.markdown_file}")
        sys.exit(1)
    
    print("=" * 60)
    print("Mermaid Diagram Extractor")
    print("=" * 60)
    print()
    
    # Extract diagrams
    diagram_count, modified_content = extract_mermaid_diagrams(
        args.markdown_file,
        args.output_dir,
        args.image_dir
    )
    
    if diagram_count > 0:
        # Create directory for modified markdown
        os.makedirs(os.path.dirname(args.modified_output), exist_ok=True)
        
        # Save modified markdown
        save_modified_markdown(modified_content, args.modified_output)
    
    print()
    print("=" * 60)
    print(f"Extraction Complete: {diagram_count} diagram(s) processed")
    print("=" * 60)
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
