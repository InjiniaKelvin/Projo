#!/bin/bash

# Remove emojis from shell scripts and batch files
echo "Removing emojis from shell scripts..."

# Find all shell and batch files
find /home/injinia47/Desktop/PROJO/Projo -type f \( -name "*.sh" -o -name "*.bat" \) \
 ! -path "*/node_modules/*" \
 ! -path "*/.git/*" \
 ! -path "*/build/*" \
 ! -path "*/dist/*" | while read -r file; do
 
 # Check if file contains emojis
 if grep -qP '[\x{1F300}-\x{1F9FF}]|[\x{2600}-\x{26FF}]|[\x{2700}-\x{27BF}]|[[OK][FAIL][WARNING][Added][Revised][LAUNCH][TARGET][NOTE][DOCS][PACKAGE][METRICS][DOCUMENT][CHECKLIST]]' "$file"; then
 echo "Cleaning: $file"
 
 # Create backup
 cp "$file" "${file}.bak"
 
 # Remove emojis with sed
 sed -i 's/[LAUNCH]/[LAUNCH]/g' "$file"
 sed -i 's/[OK]/[OK]/g' "$file"
 sed -i 's/[FAIL]/[FAIL]/g' "$file"
 sed -i 's/[WARNING]/[WARNING]/g' "$file"
 sed -i 's/[Added]/[Added]/g' "$file"
 sed -i 's/[Revised]/[Revised]/g' "$file"
 sed -i 's/[NOTE]/[NOTE]/g' "$file"
 sed -i 's/[DOCS]/[DOCS]/g' "$file"
 sed -i 's/[PACKAGE]/[PACKAGE]/g' "$file"
 sed -i 's/[METRICS]/[METRICS]/g' "$file"
 sed -i 's/[DOCUMENT]/[DOCUMENT]/g' "$file"
 sed -i 's/[CHECKLIST]/[CHECKLIST]/g' "$file"
 sed -i 's/[TARGET]/[TARGET]/g' "$file"
 sed -i 's/[SIZE]/[SIZE]/g' "$file"
 sed -i 's/[TIMER]/[TIMER]/g' "$file"
 sed -i 's/[KEYBOARD]/[KEYBOARD]/g' "$file"
 sed -i 's///g' "$file"
 sed -i 's///g' "$file"
 sed -i 's///g' "$file"
 sed -i 's/OK/OK/g' "$file"
 sed -i 's/FAIL/FAIL/g' "$file"
 
 # Remove any remaining emoji characters (comprehensive Unicode ranges)
 sed -i 's/[\xF0\x9F][\x80-\xBF]\{2\}//g' "$file"
 
 echo " Cleaned: $(basename $file)"
 fi
done

echo ""
echo "Emoji removal from scripts complete!"
echo "Backups saved with .bak extension"
