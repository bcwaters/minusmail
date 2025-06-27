Redis Storage Design for Temporary Email
Overview
Emails are stored in Redis with a 15-minute TTL, grouped by the username part of the To: field (e.g., test for test@minusmail.com). Each email is stored as a JSON string with a UUID key, and a Set tracks UUIDs per username.
Design

String Key: Each email is stored as a JSON string with a UUID key (e.g., 1234-5678-9012). JSON includes {from, subject, htmlBody, textBody, received}.
Set Key: A Set (e.g., emails:test) stores UUIDs of all emails for the username test.
TTL: 15 minutes per email (String) and Set.

Example Commands
# Store email
SETEX 1234-5678-9012 900 '{"from":"sender@example.com","subject":"Test","htmlBody":"...","textBody":"...","received":"2025-06-26T17:00:00Z"}'
SADD emails:test 1234-5678-9012
EXPIRE emails:test 900

# Retrieve emails
SMEMBERS emails:test  # Returns ["1234-5678-9012", "5678-9012-3456"]
GET 1234-5678-9012
