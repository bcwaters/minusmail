Sure! Here's a concise `README.md` for your Postfix setup:

---

# 📬 Postfix Email-to-Script Pipeline

This server is configured to receive emails for the domain `minusmail.com` and pipe them to a Node.js script for custom handling.

## 🛠 Setup Overview

1. **Install Postfix**

   ```bash
   sudo apt update
   sudo apt install postfix
   ```

2. **Configure Postfix**
   The following configuration files are used:

   * `/etc/postfix/main.cf`: Main Postfix configuration
   * `/etc/postfix/virtual`: Maps all `@minusmail.com` addresses to a local Unix user
   * `/etc/postfix/transport`: Directs email for `minusmail.com` to a custom transport
   * `/etc/postfix/master.cf`: Defines the custom `minusmail-pipe` transport using a Node.js script

3. **Compile Configuration Maps**
   After editing the files:

   ```bash
   sudo postmap /etc/postfix/virtual
   sudo postmap /etc/postfix/transport
   ```

4. **Reload Postfix**

   ```bash
   sudo systemctl reload postfix
   ```

## 📤 Email Flow

* All email to `@minusmail.com` is redirected to the local user `ubuntu`.
* Emails are delivered via the `minusmail-pipe` transport.
* The transport executes the Node.js script located at:

  ```
  /home/ubuntu/minusmail/infrastructure/EmailProcessorScript.js
  ```

## 🧪 Testing

You can send a test message:

```bash
echo -e "From: sender@minusmail.com\nTo: test@minusmail.com\nSubject: Test\n\nBody" | sendmail test@minusmail.com
```

Logs can be viewed with:

```bash
sudo tail -f /var/log/mail.log
```

---

Let me know if you'd like an init script, systemd service for the processor, or sample parsing logic.
