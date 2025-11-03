# QuickFix Documentation PDF Export Guide

## Overview

This guide explains how to convert the `QUICKFIX_FINAL_STATUS_NOVEMBER_2025.md` file into a professional PDF with all Mermaid diagrams rendered as images.

**Author:** Eng. Kelvin Mwania  
**Date:** November 3, 2025

---

## Quick Start

### One-Command Export

```bash
./export-to-pdf.sh
```

This script will:
1. ✓ Check and install Node.js (if needed)
2. ✓ Install required npm packages (mermaid-cli, md-to-pdf)
3. ✓ Check and install Chromium (if needed)
4. ✓ Extract all Mermaid diagrams
5. ✓ Render Mermaid diagrams to PNG images
6. ✓ Convert Markdown to PDF with embedded images
7. ✓ Generate professional PDF: `QuickFix_Technical_Documentation_Nov2025.pdf`

---

## Prerequisites

### System Requirements

- **Operating System:** Linux (Ubuntu/Debian recommended) or macOS
- **RAM:** Minimum 2GB available
- **Disk Space:** 500MB free space for dependencies
- **Internet Connection:** Required for installing packages

### Required Software (Auto-installed by script)

The script will automatically install these if not present:

1. **Node.js** (v18 or higher)
   - Required for npm packages
   - Auto-installed via nvm (Linux) or Homebrew (macOS)

2. **npm packages:**
   - `mermaid-cli@10.6.1` - Renders Mermaid diagrams to images
   - `md-to-pdf@5.2.4` - Converts Markdown to PDF

3. **Chromium/Chrome**
   - Required by mermaid-cli for rendering
   - Auto-installed via system package manager

4. **Python 3**
   - Usually pre-installed on Linux/macOS
   - Used for Mermaid extraction

---

## Manual Installation (If Auto-install Fails)

### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt-get update

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Chromium
sudo apt-get install -y chromium-browser

# Install npm packages globally
sudo npm install -g mermaid-cli@10.6.1 md-to-pdf@5.2.4

# Verify installations
node -v
npm -v
mmdc --version
chromium-browser --version
```

### macOS

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install Chromium
brew install --cask chromium

# Install npm packages globally
npm install -g mermaid-cli@10.6.1 md-to-pdf@5.2.4

# Verify installations
node -v
npm -v
mmdc --version
```

---

## Script Usage

### Basic Usage

```bash
# Run the export script
./export-to-pdf.sh
```

### Script Options

The script is interactive and will:
- Show progress for each step
- Display colored output (INFO/SUCCESS/WARNING/ERROR)
- Ask before opening the PDF
- Ask before deleting temporary files

### Output Files

**Generated Files:**
- `QuickFix_Technical_Documentation_Nov2025.pdf` - Final PDF (main output)
- `pdf-export-temp/` - Temporary directory (can be deleted after)
  - `mermaid-images/*.mmd` - Extracted Mermaid source files
  - `mermaid-images/*.png` - Rendered diagram images
  - `modified_documentation.md` - Markdown with image references
  - `pdf-config.json` - PDF styling configuration
  - `conversion.log` - Conversion log file

---

## PDF Features

### Professional Styling

The generated PDF includes:

**Layout:**
- A4 format (210mm × 297mm)
- 20mm margins on all sides
- Professional header: "QuickFix Technical Documentation - Eng. Kelvin Mwania"
- Page numbers in footer: "X / Y"

**Typography:**
- Font: Segoe UI (fallback: Tahoma, Geneva, Verdana, sans-serif)
- Line height: 1.6 for readability
- Maximum content width: 1000px

**Color Scheme:**
- H1 headings: Blue (#2196F3) with bottom border
- H2 headings: Darker blue (#1976D2) with light blue border
- H3 headings: Navy blue (#0D47A1)
- Tables: Blue header (#2196F3) with alternating row colors
- Code blocks: Light gray background (#f4f4f4) with blue left border
- Blockquotes: Orange left border (#FF9800)

**Elements:**
- Tables with borders and alternating row colors
- Syntax-highlighted code blocks
- Responsive images (max-width: 100%)
- Page breaks before major sections

### Mermaid Diagrams

All Mermaid diagrams are:
- Rendered to high-resolution PNG images (1200px width)
- Embedded directly in the PDF
- Centered on the page
- Scaled appropriately
- Transparent background (or white if transparency fails)

---

## Troubleshooting

### Issue: "Node.js not found"

**Solution:**
```bash
# Install Node.js manually
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
source ~/.bashrc  # or ~/.zshrc for zsh
nvm install --lts
nvm use --lts
```

### Issue: "Chromium not found"

**Solution:**
```bash
# Linux
sudo apt-get install chromium-browser

# macOS
brew install --cask chromium
```

### Issue: "mmdc: command not found"

**Solution:**
```bash
# Install mermaid-cli globally
npm install -g mermaid-cli@10.6.1

# Or with sudo if permission denied
sudo npm install -g mermaid-cli@10.6.1
```

### Issue: "PDF generation failed"

**Solution 1:** Try Pandoc as alternative
```bash
# Install Pandoc
# Linux
sudo apt-get install pandoc texlive-xetex texlive-fonts-recommended

# macOS
brew install pandoc
brew install --cask basictex

# Run Pandoc conversion
pandoc QUICKFIX_FINAL_STATUS_NOVEMBER_2025.md -o output.pdf --pdf-engine=xelatex -V geometry:margin=1in
```

**Solution 2:** Check logs
```bash
# View conversion log
cat ./pdf-export-temp/conversion.log

# View npm debug log if installation failed
npm config get cache  # Get cache location
cat ~/.npm/_logs/*-debug.log
```

### Issue: "Mermaid diagrams not rendering"

**Troubleshooting steps:**
```bash
# 1. Test mermaid-cli directly
echo "graph LR; A-->B" > test.mmd
mmdc -i test.mmd -o test.png

# 2. Check if image was created
ls -lh test.png

# 3. If fails, check Puppeteer/Chromium
mmdc --version
mmdc --help

# 4. Try with explicit Chromium path
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser mmdc -i test.mmd -o test.png
```

### Issue: "Permission denied"

**Solution:**
```bash
# Make scripts executable
chmod +x export-to-pdf.sh
chmod +x extract-mermaid.py

# If npm install fails, use sudo
sudo npm install -g mermaid-cli md-to-pdf
```

### Issue: "Python3 not found"

**Solution:**
```bash
# Linux
sudo apt-get install python3

# macOS (should be pre-installed, but if not)
brew install python3
```

---

## Advanced Usage

### Manual Step-by-Step Execution

If you prefer to run steps manually:

#### Step 1: Extract Mermaid Diagrams

```bash
python3 extract-mermaid.py QUICKFIX_FINAL_STATUS_NOVEMBER_2025.md \
    --output-dir ./mermaid-diagrams \
    --modified-output ./modified_doc.md
```

#### Step 2: Render Diagrams

```bash
# Render all .mmd files to PNG
for file in ./mermaid-diagrams/*.mmd; do
    mmdc -i "$file" -o "${file%.mmd}.png" -b transparent -w 1200
done
```

#### Step 3: Convert to PDF

```bash
# Using md-to-pdf
md-to-pdf modified_doc.md --pdf-options '{"format":"A4","margin":"20mm"}'

# Or using Pandoc
pandoc modified_doc.md -o output.pdf --pdf-engine=xelatex -V geometry:margin=1in
```

### Custom PDF Configuration

Edit `pdf-export-temp/pdf-config.json` to customize:

```json
{
  "pdf_options": {
    "format": "A4",           // Or "Letter", "Legal", "A3"
    "margin": {
      "top": "20mm",          // Adjust margins
      "right": "20mm",
      "bottom": "20mm",
      "left": "20mm"
    },
    "printBackground": true,
    "displayHeaderFooter": true
  }
}
```

### Using Different Output Filename

```bash
# Edit the script variable at the top
# OUTPUT_PDF="QuickFix_Technical_Documentation_Nov2025.pdf"
# Change to:
OUTPUT_PDF="MyCustomFilename.pdf"

# Or copy and rename after generation
cp QuickFix_Technical_Documentation_Nov2025.pdf MyDocument.pdf
```

---

## Performance Notes

### Processing Time

For the QuickFix documentation (~5,000 lines, 15+ Mermaid diagrams):

- **Fast Machine** (8GB RAM, SSD): 2-3 minutes
- **Average Machine** (4GB RAM, HDD): 4-6 minutes
- **Slow Machine** (2GB RAM): 8-10 minutes

**Breakdown:**
- Node.js installation: 1-2 minutes (first time only)
- npm package installation: 30-60 seconds (first time only)
- Mermaid extraction: 1-2 seconds
- Mermaid rendering: 30-60 seconds (depends on diagram count)
- PDF conversion: 1-2 minutes

### Resource Usage

- **CPU:** High during Chromium rendering (50-100%)
- **RAM:** ~500MB-1GB during conversion
- **Disk:** ~300MB for dependencies + ~5-10MB for output

---

## Quality Assurance

### PDF Validation Checklist

After generation, verify:

- [ ] PDF opens without errors
- [ ] All pages render correctly
- [ ] Table of contents links work (if generated)
- [ ] All Mermaid diagrams appear as images
- [ ] No broken image placeholders
- [ ] Tables are properly formatted
- [ ] Code blocks are syntax-highlighted
- [ ] Headers and footers display correctly
- [ ] Page numbers are sequential
- [ ] Images are not pixelated

### Common Quality Issues

**Issue:** Diagrams are pixelated
- **Solution:** Increase rendering width in script (change `-w 1200` to `-w 1600`)

**Issue:** Tables overflow page
- **Solution:** Add responsive table wrapper in PDF config CSS

**Issue:** Code blocks too wide
- **Solution:** Add `word-wrap: break-word` to code CSS

---

## File Structure

```
Projo/
├── QUICKFIX_FINAL_STATUS_NOVEMBER_2025.md    # Source document
├── export-to-pdf.sh                          # Main export script
├── extract-mermaid.py                        # Mermaid extraction helper
├── PDF_EXPORT_README.md                      # This file
├── QuickFix_Technical_Documentation_Nov2025.pdf  # Generated PDF
└── pdf-export-temp/                          # Temporary files (auto-created)
    ├── mermaid-images/
    │   ├── diagram_1.mmd
    │   ├── diagram_1.png
    │   ├── diagram_2.mmd
    │   ├── diagram_2.png
    │   └── ...
    ├── modified_documentation.md
    ├── pdf-config.json
    └── conversion.log
```

---

## Alternative Methods

### Method 1: VS Code Extension

1. Install "Markdown PDF" extension in VS Code
2. Open `QUICKFIX_FINAL_STATUS_NOVEMBER_2025.md`
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
4. Type "Markdown PDF: Export (pdf)"
5. Select destination

**Pros:** Simple, no command line
**Cons:** May not render Mermaid diagrams properly

### Method 2: Typora

1. Download Typora: https://typora.io/
2. Open the markdown file
3. File → Export → PDF
4. Choose destination

**Pros:** WYSIWYG, excellent Mermaid support
**Cons:** Paid software (after trial)

### Method 3: Online Converter

1. Visit: https://www.markdowntopdf.com/
2. Upload `QUICKFIX_FINAL_STATUS_NOVEMBER_2025.md`
3. Wait for conversion
4. Download PDF

**Pros:** No installation needed
**Cons:** Limited customization, privacy concerns, may not handle large files

---

## FAQ

### Q: Can I run this on Windows?

**A:** The script is designed for Linux/macOS with Bash. For Windows:
- Use WSL (Windows Subsystem for Linux)
- Use Git Bash
- Or manually run the commands in PowerShell (requires adaptation)

### Q: How do I change the PDF margins?

**A:** Edit the script's `pdf-config.json` section and change the margin values:
```json
"margin": {
  "top": "25mm",    // Change from 20mm
  "right": "25mm",
  "bottom": "25mm",
  "left": "25mm"
}
```

### Q: Can I add a custom cover page?

**A:** Yes, create a `cover.md` file and modify the script to concatenate it before conversion:
```bash
cat cover.md modified_documentation.md > final_doc.md
md-to-pdf final_doc.md
```

### Q: Why is the PDF so large?

**A:** Image-heavy PDFs with many diagrams can be large. To reduce size:
1. Compress images before embedding
2. Reduce Mermaid rendering resolution (change `-w 1200` to `-w 800`)
3. Use online PDF compression tools after generation

### Q: Can I automate this in CI/CD?

**A:** Yes, add to GitHub Actions:
```yaml
- name: Export to PDF
  run: |
    chmod +x export-to-pdf.sh
    ./export-to-pdf.sh
    
- name: Upload PDF
  uses: actions/upload-artifact@v3
  with:
    name: documentation-pdf
    path: QuickFix_Technical_Documentation_Nov2025.pdf
```

---

## Support

For issues or questions:

**Email:** engineerjuliusjr47@gmail.com  
**Phone:** +254794536984 / +254117224394  
**GitHub:** InjiniaKelvin/Projo

---

## License

This export tooling is part of the QuickFix project.

**Copyright © 2025 Eng. Kelvin Mwania**  
All Rights Reserved

---

**Last Updated:** November 3, 2025  
**Version:** 1.0
