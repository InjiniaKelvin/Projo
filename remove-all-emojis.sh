#!/bin/bash
# Remove all emojis from project files

echo "Scanning and removing emojis from all files..."

# List of files with emojis to clean
files_to_clean=(
    "emergency-fix.sh"
    "start-lightweight.sh"
    "monitor-resources.sh"
    "STABILIZATION_COMPLETE.md"
    "emergency-cleanup.sh"
    "start-dev.sh"
)

# Emoji replacements
declare -A replacements=(
    ["🚨"]="[ALERT]"
    ["🚀"]="[START]"
    ["⚠️"]="[WARNING]"
    ["✅"]="[OK]"
    ["❌"]="[ERROR]"
    ["🔧"]="[CONFIG]"
    ["💾"]="[MEMORY]"
    ["💿"]="[SWAP]"
    ["🔝"]="[TOP]"
    ["🆘"]="[HELP]"
    ["📝"]="[NOTE]"
    ["🎯"]="[TARGET]"
    ["📊"]="[STATS]"
    ["🔄"]="[REFRESH]"
    ["📁"]="[FILES]"
    ["📈"]="[PROGRESS]"
    ["💡"]="[TIP]"
)

count=0

for file in "${files_to_clean[@]}"; do
    if [ -f "$file" ]; then
        echo "Cleaning: $file"
        for emoji in "${!replacements[@]}"; do
            if grep -q "$emoji" "$file" 2>/dev/null; then
                sed -i "s/$emoji/${replacements[$emoji]}/g" "$file"
                ((count++))
            fi
        done
    fi
done

echo "Removed emojis from $count instances"
echo "Cleanup complete!"
