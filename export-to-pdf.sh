#!/bin/bash

################################################################################
# QuickFix Documentation PDF Export Script
# 
# This script automates the conversion of QUICKFIX_FINAL_STATUS_NOVEMBER_2025.md
# to a professional PDF with all Mermaid diagrams rendered as images.
#
# Author: Eng. Kelvin Mwania
# Date: November 3, 2025
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MARKDOWN_FILE="QUICKFIX_FINAL_STATUS_NOVEMBER_2025.md"
OUTPUT_PDF="QuickFix_Technical_Documentation_Nov2025.pdf"
TEMP_DIR="./pdf-export-temp"

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Node.js is installed
check_nodejs() {
    print_header "Checking Node.js Installation"
    
    if command_exists node; then
        NODE_VERSION=$(node -v)
        print_success "Node.js is already installed: $NODE_VERSION"
        return 0
    else
        print_warning "Node.js is not installed"
        return 1
    fi
}

# Function to install Node.js (if needed)
install_nodejs() {
    print_header "Installing Node.js"
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux (Ubuntu/Debian)
        print_info "Detected Linux system. Installing Node.js via nvm..."
        
        # Install nvm (Node Version Manager)
        if ! command_exists nvm; then
            print_info "Installing nvm..."
            curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
            
            # Load nvm
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        fi
        
        # Install Node.js LTS
        print_info "Installing Node.js LTS..."
        nvm install --lts
        nvm use --lts
        
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        print_info "Detected macOS. Installing Node.js via Homebrew..."
        
        if ! command_exists brew; then
            print_error "Homebrew not found. Please install Homebrew first:"
            print_error "Visit: https://brew.sh"
            exit 1
        fi
        
        brew install node
    else
        print_error "Unsupported OS: $OSTYPE"
        print_error "Please install Node.js manually from: https://nodejs.org"
        exit 1
    fi
    
    print_success "Node.js installed successfully"
}

# Function to install npm packages globally
install_npm_packages() {
    print_header "Installing Required npm Packages"
    
    # Required packages
    PACKAGES=(
        "mermaid-cli@10.6.1"
        "md-to-pdf@5.2.4"
    )
    
    for package in "${PACKAGES[@]}"; do
        PACKAGE_NAME=$(echo "$package" | cut -d@ -f1)
        print_info "Installing $PACKAGE_NAME..."
        
        if npm list -g "$PACKAGE_NAME" >/dev/null 2>&1; then
            print_success "$PACKAGE_NAME is already installed"
        else
            npm install -g "$package"
            print_success "$PACKAGE_NAME installed successfully"
        fi
    done
}

# Function to check if Chromium/Chrome is available (required by mermaid-cli)
check_chromium() {
    print_header "Checking Chromium/Chrome Installation"
    
    if command_exists chromium || command_exists chromium-browser || command_exists google-chrome || command_exists chrome; then
        print_success "Chromium/Chrome found"
        return 0
    else
        print_warning "Chromium/Chrome not found"
        return 1
    fi
}

# Function to install Chromium
install_chromium() {
    print_header "Installing Chromium"
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_info "Installing Chromium on Linux..."
        
        # Detect package manager
        if command_exists apt-get; then
            sudo apt-get update
            sudo apt-get install -y chromium-browser
        elif command_exists dnf; then
            sudo dnf install -y chromium
        elif command_exists pacman; then
            sudo pacman -S --noconfirm chromium
        else
            print_error "Could not detect package manager"
            print_warning "Please install Chromium manually"
            return 1
        fi
        
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        print_info "Installing Chromium on macOS..."
        brew install --cask chromium
    fi
    
    print_success "Chromium installed successfully"
}

# Function to create temporary directory
create_temp_dir() {
    print_header "Setting Up Temporary Directory"
    
    if [ -d "$TEMP_DIR" ]; then
        print_info "Cleaning existing temporary directory..."
        rm -rf "$TEMP_DIR"
    fi
    
    mkdir -p "$TEMP_DIR/mermaid-images"
    print_success "Temporary directory created: $TEMP_DIR"
}

# Function to extract and render Mermaid diagrams
render_mermaid_diagrams() {
    print_header "Rendering Mermaid Diagrams"
    
    if [ ! -f "$MARKDOWN_FILE" ]; then
        print_error "Markdown file not found: $MARKDOWN_FILE"
        exit 1
    fi
    
    print_info "Extracting Mermaid diagrams from $MARKDOWN_FILE..."
    
    # Use Python to extract Mermaid blocks and create individual files
    python3 << 'EOF'
import re
import os

# Read the markdown file
with open("QUICKFIX_FINAL_STATUS_NOVEMBER_2025.md", "r", encoding="utf-8") as f:
    content = f.read()

# Find all mermaid code blocks
mermaid_pattern = r'```mermaid\s*(.*?)```'
mermaid_blocks = re.findall(mermaid_pattern, content, re.DOTALL)

print(f"Found {len(mermaid_blocks)} Mermaid diagrams")

# Save each mermaid block to a separate file
for i, block in enumerate(mermaid_blocks, 1):
    filename = f"./pdf-export-temp/mermaid-images/diagram_{i}.mmd"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(block.strip())
    print(f"Saved diagram {i} to {filename}")

# Create a modified markdown file with image placeholders
modified_content = content
for i in range(len(mermaid_blocks)):
    # Replace mermaid block with image reference
    modified_content = re.sub(
        r'```mermaid\s*.*?```',
        f'![Mermaid Diagram {i+1}](./pdf-export-temp/mermaid-images/diagram_{i+1}.png)',
        modified_content,
        count=1,
        flags=re.DOTALL
    )

# Save modified markdown
with open("./pdf-export-temp/modified_documentation.md", "w", encoding="utf-8") as f:
    f.write(modified_content)

print("Modified markdown file created")
EOF
    
    print_success "Extracted Mermaid diagrams"
    
    # Count the number of Mermaid files
    MERMAID_COUNT=$(ls -1 "$TEMP_DIR/mermaid-images"/*.mmd 2>/dev/null | wc -l)
    
    if [ "$MERMAID_COUNT" -eq 0 ]; then
        print_warning "No Mermaid diagrams found in the document"
        return 0
    fi
    
    print_info "Rendering $MERMAID_COUNT Mermaid diagrams to PNG images..."
    
    # Render each Mermaid diagram
    for mmd_file in "$TEMP_DIR/mermaid-images"/*.mmd; do
        if [ -f "$mmd_file" ]; then
            filename=$(basename "$mmd_file" .mmd)
            print_info "Rendering $filename..."
            
            # Use mmdc (mermaid-cli) to render
            mmdc -i "$mmd_file" -o "$TEMP_DIR/mermaid-images/${filename}.png" -b transparent -w 1200 -H 800 2>/dev/null || {
                print_warning "Failed to render $filename, trying with different settings..."
                mmdc -i "$mmd_file" -o "$TEMP_DIR/mermaid-images/${filename}.png" -b white -w 1200 2>/dev/null || {
                    print_error "Failed to render $filename"
                }
            }
        fi
    done
    
    # Verify rendered images
    PNG_COUNT=$(ls -1 "$TEMP_DIR/mermaid-images"/*.png 2>/dev/null | wc -l)
    print_success "Successfully rendered $PNG_COUNT/$MERMAID_COUNT diagrams to PNG"
}

# Function to convert Markdown to PDF
convert_to_pdf() {
    print_header "Converting Markdown to PDF"
    
    # Check if modified markdown exists
    MODIFIED_MD="$TEMP_DIR/modified_documentation.md"
    if [ ! -f "$MODIFIED_MD" ]; then
        print_warning "No modified markdown found, using original file"
        MODIFIED_MD="$MARKDOWN_FILE"
    fi
    
    print_info "Converting $MODIFIED_MD to $OUTPUT_PDF..."
    
    # Create PDF configuration
    cat > "$TEMP_DIR/pdf-config.json" << 'PDFCONFIG'
{
  "stylesheet": [
    "https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.0/github-markdown.min.css"
  ],
  "css": "
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      max-width: 1000px;
      margin: 40px auto;
      padding: 20px;
    }
    h1 { 
      color: #2196F3; 
      border-bottom: 3px solid #2196F3;
      padding-bottom: 10px;
      page-break-before: always;
    }
    h1:first-of-type {
      page-break-before: avoid;
    }
    h2 { 
      color: #1976D2; 
      border-bottom: 2px solid #E3F2FD;
      padding-bottom: 8px;
      margin-top: 30px;
    }
    h3 { 
      color: #0D47A1;
      margin-top: 20px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 20px 0;
    }
    table, th, td {
      border: 1px solid #ddd;
    }
    th {
      background-color: #2196F3;
      color: white;
      padding: 12px;
      text-align: left;
    }
    td {
      padding: 10px;
    }
    tr:nth-child(even) {
      background-color: #f2f2f2;
    }
    code {
      background-color: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    pre {
      background-color: #f4f4f4;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      border-left: 4px solid #2196F3;
    }
    blockquote {
      border-left: 4px solid #FF9800;
      padding-left: 15px;
      margin-left: 0;
      color: #666;
      font-style: italic;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 20px auto;
    }
    .page-break {
      page-break-after: always;
    }
  ",
  "body_class": "markdown-body",
  "marked_options": {
    "headerIds": true,
    "smartypants": true
  },
  "pdf_options": {
    "format": "A4",
    "margin": {
      "top": "20mm",
      "right": "20mm",
      "bottom": "20mm",
      "left": "20mm"
    },
    "printBackground": true,
    "displayHeaderFooter": true,
    "headerTemplate": "<div style='font-size: 10px; text-align: center; width: 100%; color: #666;'>QuickFix Technical Documentation - Eng. Kelvin Mwania</div>",
    "footerTemplate": "<div style='font-size: 10px; text-align: center; width: 100%; color: #666;'><span class='pageNumber'></span> / <span class='totalPages'></span></div>"
  }
}
PDFCONFIG
    
    print_success "PDF configuration created"
    
    # Convert to PDF using md-to-pdf
    print_info "Running md-to-pdf converter..."
    
    md-to-pdf "$MODIFIED_MD" \
        --config-file "$TEMP_DIR/pdf-config.json" \
        --pdf-options '{"format":"A4","margin":"20mm","printBackground":true}' \
        --as-html \
        2>&1 | tee "$TEMP_DIR/conversion.log"
    
    # Move the generated PDF to the desired location
    if [ -f "$TEMP_DIR/modified_documentation.pdf" ]; then
        mv "$TEMP_DIR/modified_documentation.pdf" "$OUTPUT_PDF"
        print_success "PDF generated successfully: $OUTPUT_PDF"
    elif [ -f "${MODIFIED_MD%.md}.pdf" ]; then
        mv "${MODIFIED_MD%.md}.pdf" "$OUTPUT_PDF"
        print_success "PDF generated successfully: $OUTPUT_PDF"
    else
        print_error "PDF generation failed. Check the log: $TEMP_DIR/conversion.log"
        return 1
    fi
}

# Alternative function using Pandoc (if md-to-pdf fails)
convert_with_pandoc() {
    print_header "Converting Markdown to PDF using Pandoc"
    
    print_info "Checking if Pandoc is installed..."
    
    if ! command_exists pandoc; then
        print_warning "Pandoc not found. Installing..."
        
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            if command_exists apt-get; then
                sudo apt-get update
                sudo apt-get install -y pandoc texlive-xetex texlive-fonts-recommended
            else
                print_error "Please install Pandoc manually: https://pandoc.org/installing.html"
                return 1
            fi
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            brew install pandoc
            brew install --cask basictex
        fi
    fi
    
    MODIFIED_MD="$TEMP_DIR/modified_documentation.md"
    if [ ! -f "$MODIFIED_MD" ]; then
        MODIFIED_MD="$MARKDOWN_FILE"
    fi
    
    print_info "Converting with Pandoc..."
    
    pandoc "$MODIFIED_MD" \
        -o "$OUTPUT_PDF" \
        --pdf-engine=xelatex \
        -V geometry:margin=1in \
        -V fontsize=11pt \
        -V colorlinks=true \
        -V linkcolor=blue \
        -V urlcolor=blue \
        -V toccolor=blue \
        --toc \
        --toc-depth=3 \
        --number-sections \
        --highlight-style=tango \
        2>&1 | tee "$TEMP_DIR/pandoc.log"
    
    if [ -f "$OUTPUT_PDF" ]; then
        print_success "PDF generated successfully with Pandoc: $OUTPUT_PDF"
        return 0
    else
        print_error "Pandoc conversion failed"
        return 1
    fi
}

# Function to cleanup temporary files
cleanup() {
    print_header "Cleaning Up"
    
    read -p "$(echo -e ${YELLOW}Do you want to remove temporary files? [y/N]: ${NC})" -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Removing temporary directory..."
        rm -rf "$TEMP_DIR"
        print_success "Temporary files removed"
    else
        print_info "Temporary files kept in: $TEMP_DIR"
        print_info "You can manually delete them later"
    fi
}

# Function to open the PDF
open_pdf() {
    print_header "Opening PDF"
    
    if [ ! -f "$OUTPUT_PDF" ]; then
        print_error "PDF file not found: $OUTPUT_PDF"
        return 1
    fi
    
    read -p "$(echo -e ${YELLOW}Do you want to open the PDF now? [Y/n]: ${NC})" -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        print_info "Opening $OUTPUT_PDF..."
        
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            xdg-open "$OUTPUT_PDF" 2>/dev/null || {
                print_warning "Could not open PDF automatically"
                print_info "Please open manually: $OUTPUT_PDF"
            }
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            open "$OUTPUT_PDF"
        fi
    fi
}

# Function to display final statistics
display_statistics() {
    print_header "Export Statistics"
    
    if [ -f "$OUTPUT_PDF" ]; then
        FILE_SIZE=$(du -h "$OUTPUT_PDF" | cut -f1)
        print_success "PDF File: $OUTPUT_PDF"
        print_success "File Size: $FILE_SIZE"
        
        if [ -d "$TEMP_DIR/mermaid-images" ]; then
            DIAGRAM_COUNT=$(ls -1 "$TEMP_DIR/mermaid-images"/*.png 2>/dev/null | wc -l)
            print_success "Mermaid Diagrams Rendered: $DIAGRAM_COUNT"
        fi
        
        # Calculate page count (approximate)
        if command_exists pdfinfo; then
            PAGE_COUNT=$(pdfinfo "$OUTPUT_PDF" 2>/dev/null | grep "Pages:" | awk '{print $2}')
            if [ -n "$PAGE_COUNT" ]; then
                print_success "Total Pages: $PAGE_COUNT"
            fi
        fi
    else
        print_error "PDF was not generated"
    fi
}

################################################################################
# MAIN EXECUTION
################################################################################

main() {
    clear
    
    print_header "QuickFix Documentation PDF Export"
    print_info "Starting PDF export process..."
    print_info "Source: $MARKDOWN_FILE"
    print_info "Output: $OUTPUT_PDF"
    echo ""
    
    # Step 1: Check and install Node.js
    if ! check_nodejs; then
        install_nodejs
    fi
    
    # Step 2: Install npm packages
    install_npm_packages
    
    # Step 3: Check and install Chromium
    if ! check_chromium; then
        install_chromium
    fi
    
    # Step 4: Create temporary directory
    create_temp_dir
    
    # Step 5: Render Mermaid diagrams
    render_mermaid_diagrams
    
    # Step 6: Convert to PDF
    if ! convert_to_pdf; then
        print_warning "md-to-pdf failed, trying Pandoc as alternative..."
        if ! convert_with_pandoc; then
            print_error "Both conversion methods failed"
            cleanup
            exit 1
        fi
    fi
    
    # Step 7: Display statistics
    display_statistics
    
    # Step 8: Open PDF
    open_pdf
    
    # Step 9: Cleanup
    cleanup
    
    print_header "Export Complete!"
    print_success "Your professional PDF documentation is ready!"
    echo ""
}

# Run main function
main "$@"
