#!/bin/bash

echo "Looking for Firebase service account JSON file..."
echo ""

# Check common download locations
POSSIBLE_PATHS=(
    ~/Downloads/divtrack*.json
    ~/Downloads/*firebase*.json
    ~/Downloads/*adminsdk*.json
    ./*divtrack*.json
    ./*firebase*.json
)

FOUND_FILE=""
for pattern in "${POSSIBLE_PATHS[@]}"; do
    for file in $pattern 2>/dev/null; do
        if [ -f "$file" ]; then
            echo "Found: $file"
            FOUND_FILE="$file"
            break 2
        fi
    done
done

if [ -z "$FOUND_FILE" ]; then
    echo "❌ No Firebase service account JSON found"
    echo ""
    echo "Please download it from:"
    echo "https://console.firebase.google.com/project/divtrack-6a09d/settings/serviceaccounts/adminsdk"
    echo ""
    echo "Click 'Generate New Private Key' and save the file to your Downloads folder"
    echo "Then run this script again"
    exit 1
fi

echo ""
echo "✅ Found Firebase service account key: $FOUND_FILE"
echo ""
echo "Extracting credentials..."

# Extract private_key and client_email using jq or node
if command -v jq &> /dev/null; then
    PRIVATE_KEY=$(jq -r '.private_key' "$FOUND_FILE")
    CLIENT_EMAIL=$(jq -r '.client_email' "$FOUND_FILE")
elif command -v node &> /dev/null; then
    PRIVATE_KEY=$(node -e "console.log(require('$FOUND_FILE').private_key)")
    CLIENT_EMAIL=$(node -e "console.log(require('$FOUND_FILE').client_email)")
else
    echo "❌ Need either 'jq' or 'node' to extract credentials"
    exit 1
fi

# Update .env file
echo "Updating backend/.env..."
cd backend

# Escape the private key for sed
ESCAPED_KEY=$(echo "$PRIVATE_KEY" | sed 's/[\/&]/\\&/g')

# Update the .env file
sed -i 's|^# FIREBASE_PRIVATE_KEY=.*|FIREBASE_PRIVATE_KEY="'"$PRIVATE_KEY"'"|' .env
sed -i 's|^# FIREBASE_CLIENT_EMAIL=.*|FIREBASE_CLIENT_EMAIL='"$CLIENT_EMAIL"'|' .env

echo "✅ Firebase credentials added to backend/.env"
echo ""
echo "Starting backend server..."
npm run dev
