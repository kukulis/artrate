# Postfix Email Server Configuration Guide

Complete guide for setting up Postfix with SPF, DKIM, and DMARC authentication on Ubuntu/Debian.

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Basic Postfix Configuration](#basic-postfix-configuration)
- [SPF Configuration](#spf-configuration)
- [DKIM Configuration](#dkim-configuration)
- [DMARC Configuration](#dmarc-configuration)
- [Sender Address Rewriting](#sender-address-rewriting)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Useful Commands](#useful-commands)

## Overview

This guide sets up a fully authenticated email server capable of:
- Sending emails with SPF, DKIM, and DMARC authentication
- Receiving emails for your domain
- Passing Gmail and other major providers' authentication checks

**Example configuration:**
- Domain: `darbelis.eu`
- Mail server: `mail.darbelis.eu`
- Server IP: `195.181.243.102`
- Server hostname: `b0e54.k.dedikuoti.lt`

## Prerequisites

- Ubuntu/Debian server with root access
- Domain name with DNS management access
- Static IP address
- Port 25 open (outbound and inbound)

## Installation

### 1. Install Required Packages

```bash
sudo apt-get update
sudo apt-get install postfix mailutils opendkim opendkim-tools
```

During Postfix installation:
- Select: **"Internet Site"**
- System mail name: Your domain (e.g., `darbelis.eu`)

### 2. Remove Conflicting Mail Servers

If you have sendmail installed, remove it:

```bash
sudo systemctl stop sendmail
sudo systemctl disable sendmail
sudo apt-get remove --purge sendmail sendmail-bin sendmail-base sendmail-cf
```

Postfix and sendmail cannot coexist.

## Basic Postfix Configuration

### Edit `/etc/postfix/main.cf`

```bash
sudo nano /etc/postfix/main.cf
```

Key settings to configure:

```conf
# Basic settings
myhostname = mail.darbelis.eu
mydomain = darbelis.eu
myorigin = $mydomain

# Accept mail for these domains
mydestination = $myhostname, darbelis.eu, mail.darbelis.eu, b0e54.k.dedikuoti.lt, localhost

# Network settings
inet_interfaces = all
inet_protocols = ipv4

# Disable IPv6 if not properly configured
# Gmail requires proper IPv6 PTR records if using IPv6
inet_protocols = ipv4
```

### Rebuild Aliases Database

```bash
sudo newaliases
sudo systemctl restart postfix
```

## SPF Configuration

SPF (Sender Policy Framework) tells receiving servers which IPs can send email for your domain.

### Add DNS TXT Record

Add to your domain's DNS (e.g., `darbelis.eu`):

```
Type: TXT
Name: @
Value: v=spf1 ip4:195.181.243.102 a mx -all
```

**Important:** Only ONE SPF record per domain. Multiple SPF records will ALL be ignored.

If you need to include other senders:

```
v=spf1 ip4:195.181.243.102 a mx include:spf.serveriai.lt -all
```

### SPF Policy Flags

- `+all` - Allow all (not recommended)
- `~all` - Soft fail (mark as suspicious but accept)
- `-all` - Hard fail (reject unauthorized senders) - **Recommended**

### Verify SPF

```bash
dig @8.8.8.8 darbelis.eu TXT +short
host -t txt darbelis.eu
```

Should show your SPF record.

## DKIM Configuration

DKIM (DomainKeys Identified Mail) signs outgoing emails with a cryptographic signature.

### 1. Generate DKIM Keys

```bash
# Create directory structure
sudo mkdir -p /etc/opendkim/keys/darbelis.eu
cd /etc/opendkim/keys/darbelis.eu

# Generate keys
sudo opendkim-genkey -t -s mail -d darbelis.eu

# Set permissions
sudo chown -R opendkim:opendkim /etc/opendkim
sudo chmod 600 /etc/opendkim/keys/darbelis.eu/mail.private
```

This creates two files:
- `mail.private` - Private key (keep secret)
- `mail.txt` - Public key (publish in DNS)

### 2. Configure OpenDKIM

Edit `/etc/opendkim.conf`:

```bash
sudo nano /etc/opendkim.conf
```

Add/modify these settings:

```conf
Syslog                  yes
SyslogSuccess           yes
LogWhy                  yes

Domain                  darbelis.eu
Selector                mail
KeyFile                 /etc/opendkim/keys/darbelis.eu/mail.private

Socket                  inet:8891@localhost
PidFile                 /var/run/opendkim/opendkim.pid

UserID                  opendkim:opendkim
UMask                   002

Canonicalization        relaxed/simple
Mode                    sv
AutoRestart             yes
AutoRestartRate         10/1h
```

### 3. Connect Postfix to OpenDKIM

Edit `/etc/postfix/main.cf`:

```bash
sudo nano /etc/postfix/main.cf
```

Add at the end:

```conf
# DKIM
milter_default_action = accept
milter_protocol = 6
smtpd_milters = inet:localhost:8891
non_smtpd_milters = inet:localhost:8891
```

### 4. Get Public Key

```bash
sudo cat /etc/opendkim/keys/darbelis.eu/mail.txt
```

You'll see something like:

```
mail._domainkey IN TXT ( "v=DKIM1; h=sha256; k=rsa; t=y; "
    "p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsxOq6PG46FAa..."
    "...more characters..." )
```

### 5. Add DKIM DNS Record

Combine all text between quotes into ONE line and add to DNS:

```
Type: TXT
Name: mail._domainkey
Value: v=DKIM1; h=sha256; k=rsa; t=y; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsxOq6PG46FAa6EpKc3LHPI1eYrxNtSaUbD2suaw5SxIH6vK8IlWDvjxPR1mp1EaHr0125r2uaZGUjUPLk5LBBKwV7RX49WHOWNlJaPxFzAyNuMiOCFzPtjpJfwh3HwdWtqCpOS7MNhWfIvfcYV7OlePQLW9oIU+/API/nCDYDT89QIhr2aGnu+4DfZHY+I5wbdV9IbfmfkKQKJEBBm8jJDEIN2CA/SOL0a2yoLfVQ0TVZQwzsdMKYxqkO6WCx15ZzO+0R8mSORq7hwrKYMMixWe3JRmTH4wQwSjD4BO4M5OE2DLpxIqnK0qxrRl4UbM7z9RAgV9ZSXCdP6OTpya08QIDAQAB
```

**Important:** Copy the ENTIRE public key - it's very long (300+ characters).

### 6. Restart Services

```bash
sudo systemctl enable opendkim
sudo systemctl restart opendkim
sudo systemctl restart postfix
```

### 7. Verify DKIM DNS

```bash
dig @8.8.8.8 mail._domainkey.darbelis.eu TXT +short
host -t txt mail._domainkey.darbelis.eu
```

Should show your complete DKIM public key.

## DMARC Configuration

DMARC (Domain-based Message Authentication, Reporting & Conformance) tells receivers what to do with unauthenticated emails.

### Add DMARC DNS Record

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:giedrius@darbelis.eu
```

**DMARC Policies:**
- `p=none` - Monitor only, don't reject (recommended for initial setup)
- `p=quarantine` - Mark unauthenticated emails as spam
- `p=reject` - Reject unauthenticated emails entirely

**Optional parameters:**
- `rua=mailto:email@domain.com` - Send aggregate reports
- `ruf=mailto:email@domain.com` - Send forensic reports
- `pct=100` - Percentage of messages to apply policy (default 100)

### Verify DMARC

```bash
dig @8.8.8.8 _dmarc.darbelis.eu TXT +short
```

## Sender Address Rewriting

If your server hostname differs from your mail domain, you need to rewrite sender addresses.

**Problem:** Emails sent from `user@server-hostname.com` won't match your DKIM domain.

**Solution:** Rewrite all outgoing addresses to use your mail domain.

### Configure Generic Mapping

Edit `/etc/postfix/main.cf`:

```bash
sudo nano /etc/postfix/main.cf
```

Add:

```conf
# Rewrite sender address
smtp_generic_maps = hash:/etc/postfix/generic
```

Create mapping file:

```bash
sudo nano /etc/postfix/generic
```

Add mappings (one per line):

```
giedrius@b0e54.k.dedikuoti.lt    giedrius@darbelis.eu
root@b0e54.k.dedikuoti.lt        root@darbelis.eu
```

Build database and restart:

```bash
sudo postmap /etc/postfix/generic
sudo systemctl restart postfix
```

## Testing

### Test Sending Email

```bash
echo "Test message" | mail -s "Test Subject" recipient@gmail.com
```

### Check Logs

```bash
sudo tail -f /var/log/mail.log
```

Look for:
- `DKIM-Signature:` - Email is being signed (good)
- `status=sent` - Email delivered successfully
- `no signing domain match` - Sender rewriting not working (bad)

### Verify Authentication in Gmail

1. Open received email in Gmail
2. Click three dots (⋮) → **"Show original"**
3. Check authentication results:

```
SPF: PASS
DKIM: PASS with domain darbelis.eu
DMARC: PASS
```

### Online Testing Tools

Send test email to these services:

- **Mail Tester:** https://www.mail-tester.com/
  - Sends you a unique email address
  - Grades your email server (aim for 10/10)

- **MX Toolbox:** https://mxtoolbox.com/SuperTool.aspx
  - Check SPF, DKIM, DMARC records
  - Verify DNS configuration

- **DKIM Validator:** https://appmaildev.com/en/dkim
  - Verify DKIM signature

### Test Receiving Email

Send from Gmail or another provider to `user@yourdomain.com`:

```bash
# Check if email arrived
mail

# Or view mailbox directly
cat /var/mail/username
```

## Troubleshooting

### Emails Go to Spam

**Cause:** New domain with no reputation.

**Solutions:**
1. Verify SPF, DKIM, DMARC all show PASS
2. Set up PTR (reverse DNS) record
3. Send legitimate emails (not tests)
4. Ask recipients to mark as "Not Spam"
5. Build reputation over time (weeks/months)

### Gmail Rejects with IPv6 Error

**Error:** `Gmail has detected that this message does not meet IPv6 sending guidelines`

**Solution:** Disable IPv6 in `/etc/postfix/main.cf`:

```conf
inet_protocols = ipv4
```

Restart Postfix:

```bash
sudo systemctl restart postfix
```

### "No Signing Domain Match" in Logs

**Error:** `opendkim: no signing domain match for 'server-hostname'`

**Cause:** Email sent from `user@server-hostname` instead of `user@yourdomain.com`

**Solution:** Configure sender address rewriting (see [Sender Address Rewriting](#sender-address-rewriting))

### "Temporary Lookup Failure" for Aliases

**Error:** `hash:/etc/aliases is unavailable. open database /etc/aliases.db: No such file or directory`

**Solution:**

```bash
sudo newaliases
sudo systemctl restart postfix
```

### Cannot Receive Email

**Checks:**

1. Verify domain in `mydestination`:
```bash
postconf mydestination
# Should include: yourdomain.com
```

2. Check MX record:
```bash
dig yourdomain.com MX
```

3. Verify port 25 is open:
```bash
sudo netstat -tulpn | grep :25
```

4. Check logs for errors:
```bash
sudo tail -100 /var/log/mail.log | grep -i error
```

### PTR Record Mismatch

**Check current PTR:**

```bash
host YOUR_IP_ADDRESS
```

**Verify forward-confirmed reverse DNS (FCrDNS):**

```bash
host YOUR_IP_ADDRESS
# Should return: XX.XX.XX.XX.in-addr.arpa domain name pointer mail.yourdomain.com

host mail.yourdomain.com
# Should return: mail.yourdomain.com has address XX.XX.XX.XX
```

If both match, FCrDNS passes (acceptable).

**Best practice:** PTR should point to mail server hostname (`mail.yourdomain.com`). Contact your hosting provider to set PTR record.

### Multiple SPF Records

**Error:** Authentication fails even with correct SPF.

**Cause:** Multiple SPF TXT records in DNS (all will be ignored).

**Solution:** Combine into ONE record:

```
# Wrong - multiple records
v=spf1 ip4:1.2.3.4 -all
v=spf1 include:example.com -all

# Correct - single record
v=spf1 ip4:1.2.3.4 include:example.com -all
```

## Useful Commands

### Mail Queue Management

```bash
# View mail queue
mailq
postqueue -p

# Flush queue (retry sending)
sudo postqueue -f

# Delete all messages in queue
sudo postsuper -d ALL

# Delete deferred messages only
sudo postsuper -d ALL deferred
```

### Log Monitoring

```bash
# Watch logs in real-time
sudo tail -f /var/log/mail.log

# Show only errors
sudo grep -i error /var/log/mail.log

# Show DKIM activity
sudo grep -i dkim /var/log/mail.log

# Show deliveries to specific address
sudo grep "to=<user@example.com>" /var/log/mail.log
```

### DNS Verification

```bash
# Check SPF
dig @8.8.8.8 yourdomain.com TXT +short
host -t txt yourdomain.com

# Check DKIM
dig @8.8.8.8 mail._domainkey.yourdomain.com TXT +short
host -t txt mail._domainkey.yourdomain.com

# Check DMARC
dig @8.8.8.8 _dmarc.yourdomain.com TXT +short

# Check MX records
dig yourdomain.com MX

# Check PTR (reverse DNS)
host YOUR_IP_ADDRESS
```

### Service Management

```bash
# Restart services
sudo systemctl restart postfix
sudo systemctl restart opendkim

# Check service status
sudo systemctl status postfix
sudo systemctl status opendkim

# View service logs
sudo journalctl -u postfix -f
sudo journalctl -u opendkim -f

# Enable services at boot
sudo systemctl enable postfix
sudo systemctl enable opendkim
```

### Configuration Testing

```bash
# Check Postfix configuration
sudo postfix check

# View configuration values
postconf
postconf | grep mydestination
postconf | grep milter

# Reload configuration (without restart)
sudo postfix reload
```

### Mail Reading

```bash
# Interactive mail reader
mail

# Common mail commands (inside mail):
# h        - List headers
# 1        - Read message 1
# d 1      - Delete message 1
# q        - Quit (save changes)
# x        - Exit (don't save changes)

# View mailbox directly
cat /var/mail/username
tail -50 /var/mail/username
```

### Testing Email Delivery

```bash
# Send test email
echo "Message body" | mail -s "Subject line" recipient@example.com

# Send with verbose output
echo "Test" | mail -v -s "Subject" recipient@example.com

# Send from specific sender
echo "Test" | mail -r "sender@yourdomain.com" -s "Subject" recipient@example.com
```

## DNS Records Summary

Complete DNS configuration for `yourdomain.com`:

```
# A Records
@           A       195.181.243.102
mail        A       195.181.243.102
*           A       195.181.243.102

# MX Record
@           MX      10 yourdomain.com.

# SPF Record
@           TXT     "v=spf1 ip4:195.181.243.102 a mx -all"

# DKIM Record (get from /etc/opendkim/keys/yourdomain.com/mail.txt)
mail._domainkey TXT "v=DKIM1; h=sha256; k=rsa; t=y; p=YOUR_VERY_LONG_PUBLIC_KEY"

# DMARC Record
_dmarc      TXT     "v=DMARC1; p=none; rua=mailto:admin@yourdomain.com"
```

## Security Best Practices

1. **Keep software updated:**
   ```bash
   sudo apt-get update
   sudo apt-get upgrade postfix opendkim
   ```

2. **Restrict relay:** Ensure only local users can send email (default Postfix config)

3. **Use strong DKIM keys:** Generate 2048-bit RSA keys (default with opendkim-genkey)

4. **Monitor logs regularly:** Watch for unauthorized relay attempts

5. **Set up fail2ban:** Protect against brute-force attacks
   ```bash
   sudo apt-get install fail2ban
   ```

6. **Enable TLS:** For encrypted connections (automatically enabled in modern Postfix)

7. **Rotate DKIM keys:** Every 6-12 months, generate new keys

## References

- Postfix Documentation: http://www.postfix.org/documentation.html
- SPF Record Syntax: https://www.rfc-editor.org/rfc/rfc7208
- DKIM Standard: https://www.rfc-editor.org/rfc/rfc6376
- DMARC Guide: https://dmarc.org/overview/
- Gmail Sender Guidelines: https://support.google.com/mail/answer/81126

## Quick Setup Checklist

- [ ] Install Postfix, mailutils, opendkim
- [ ] Configure `/etc/postfix/main.cf` (hostname, mydestination, inet_protocols)
- [ ] Add SPF DNS TXT record
- [ ] Generate DKIM keys
- [ ] Configure OpenDKIM (`/etc/opendkim.conf`)
- [ ] Connect Postfix to OpenDKIM (milters in main.cf)
- [ ] Add DKIM DNS TXT record
- [ ] Add DMARC DNS TXT record
- [ ] Configure sender rewriting if needed (`/etc/postfix/generic`)
- [ ] Run `sudo newaliases`
- [ ] Restart services
- [ ] Test sending email
- [ ] Verify SPF/DKIM/DMARC PASS in Gmail
- [ ] Test receiving email
- [ ] Check mail-tester.com score (aim for 10/10)
- [ ] Set up PTR record with hosting provider

---

**Server Configuration Example:**
- Domain: `darbelis.eu`
- Mail Server: `mail.darbelis.eu`
- IP: `195.181.243.102`
- User: `giedrius@darbelis.eu`

Document created: 2026-01-03
