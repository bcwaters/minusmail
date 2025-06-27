#!/bin/bash

# Script to add an email to a user using the new Redis design
# Usage: ./add-email.sh <username> [from] [subject] [message]

# Default values
USERNAME=${1:-"minus"}
FROM=${2:-"sender@minusmail.com"}
SUBJECT=${3:-"Test Email for $USERNAME"}
MESSAGE=${4:-"This is a test email for user: $USERNAME"}

# Current timestamp in ISO format
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# API endpoint
API_URL="http://localhost:3000/email/username/$USERNAME/store"

echo "Adding email to user: $USERNAME"
echo "From: $FROM"
echo "Subject: $SUBJECT"
echo "Message: $MESSAGE"
echo "Timestamp: $TIMESTAMP"
echo "API URL: $API_URL"
echo ""

# Send the request
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"from\": \"$FROM\",
    \"subject\": \"$SUBJECT\",
    \"htmlBody\": \"<p>$MESSAGE</p><p><em>Sent at: $TIMESTAMP</em></p>\",
    \"textBody\": \"$MESSAGE - Sent at: $TIMESTAMP\",
    \"received\": \"$TIMESTAMP\"
  }" \
  -s | jq '.'

echo ""
echo "Email added successfully!" 