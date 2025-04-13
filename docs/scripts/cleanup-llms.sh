#!/bin/bash

# Path to the llms.txt file
LLMS_FILE=".vitepress/dist/llms.txt"

# Create a temporary file
TEMP_FILE=$(mktemp)

# Read the file and process it
awk '
    # Counter for About LogLayer occurrences
    BEGIN { count = 0 }
    
    {
        # Check if this line contains "About LogLayer"
        if ($0 ~ /- \[About LogLayer\]/) {
            count++
        }
        
        # Print lines until we find the second occurrence
        if (count < 2) {
            print
        }
    }
' "$LLMS_FILE" > "$TEMP_FILE"

# Replace the original file with the cleaned version
mv "$TEMP_FILE" "$LLMS_FILE"

echo "Cleaned up redundant items in $LLMS_FILE" 