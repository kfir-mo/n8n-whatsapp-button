# 🚀 WhatsApp Node - Quick Setup & Usage Guide

## ✅ SETUP COMPLETE

Your n8n instance is now running with the WhatsApp node loaded!

**Access n8n:** http://localhost:5678

---

## 📋 STEP-BY-STEP: How to Use WhatsApp Node

### STEP 1: Create WhatsApp Credential

1. **Open n8n** → Go to **Credentials** (top right)
2. Click **Create New**
3. Search for **"WhatsApp API"** and select it
4. Fill in 3 fields (get these from Meta Business Manager):

   ```
   Phone Number ID:     Your WhatsApp Phone Number ID (e.g., 102345123451234)
   Business Account ID: Your WhatsApp Business Account ID (e.g., 987654321098765)
   Access Token:        Meta access token with WhatsApp permissions
   ```

5. Click **Test** to verify it works (should show your phone number)
6. Click **Save**

---

### STEP 2: Create Your First Workflow

1. Click **+** to create a new workflow
2. Add **Manual Trigger** node (start)
3. Click **+** to add another node
4. Search for **"WhatsApp"** and select it
5. Select your WhatsApp credential

---

### STEP 3: Send a Simple Text Message

In the WhatsApp node settings:

```
Operation:    Send Text Message
Phone Number: +1234567890  (your phone with country code)
Message Text: Hello! Testing n8n WhatsApp 🎉
```

Click **Test** to send!

You should receive the message on WhatsApp. ✓

---

### STEP 4: Send Message with Buttons

In the WhatsApp node settings:

```
Operation:    Send Message with Buttons
Phone Number: +1234567890
Message Text: What would you like to do?

Buttons:
  • Button 1: ID = "btn_update" | Title = "Update 📝"
  • Button 2: ID = "btn_cancel" | Title = "Cancel ❌"
  • Button 3: ID = "btn_help"   | Title = "Help 💬"
```

Click **Test** to send!

The message will appear in WhatsApp with 3 clickable buttons.

---

## 🎯 COMMON EXAMPLES

### Example 1: Dynamic Data (from previous node)

```
Input Node (from database)
    ↓
WhatsApp Node:
  Phone Number: {{ $json.phone }}
  Message Text: Hello {{ $json.name }}!
  Button: "Reply"
```

### Example 2: Conditional Messages

```
Check Status Node
    ↓
If "active" → Send "Welcome back!"
If "inactive" → Send "Come back soon!"
If "blocked" → Send "Please contact support"
```

### Example 3: Bulk Messages (Loop)

```
Get all customers
    ↓
For each customer:
  - Send WhatsApp with personalized message
  - Store response
```

---

## 🔑 Phone Number Format

**MUST include country code:**
- ✅ Correct: `+1234567890` (US)
- ✅ Correct: `+972501234567` (Israel)
- ✅ Correct: `+447123456789` (UK)
- ❌ Wrong: `1234567890` (no country code)

---

## 🎨 Button Configuration

**Rules:**
- Maximum 3-10 buttons per message (depends on API)
- Button Title: max 20 characters
- Button ID: any unique identifier (returned when clicked)
- Emoji supported in titles: "Update 📝", "Help 💬"

**Example:**
```
Button 1:
  ID: btn_attractions
  Title: Find Attractions 🎡

Button 2:
  ID: btn_flight
  Title: Change Flight ✈️

Button 3:
  ID: btn_hotel
  Title: Change Hotel 🏨
```

---

## 📊 Response Format

When message is sent successfully, you get:

```json
{
  "messaging_product": "whatsapp",
  "contacts": [
    {
      "input": "+1234567890",
      "wa_id": "1234567890"
    }
  ],
  "messages": [
    {
      "id": "wamid.HBEUGVlBXfAFAXXXXXXXXXXXXXX"
    }
  ]
}
```

Save this `id` to track the message.

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **Node not showing** | Restart n8n browser tab and refresh |
| **"Invalid phone number"** | Add country code: `+1234567890` |
| **Messages not sending** | Test credential first to verify access token |
| **Buttons not appearing** | Check they're under 20 characters |
| **Rate limit errors** | Add 1-2 second delay between messages |
| **Access token expired** | Regenerate new token in Meta Business Manager |

---

## 💡 Pro Tips

1. **Always test credentials first** - Use "Test" button in credential
2. **Test messages to yourself** - Verify before sending to customers
3. **Add logging nodes** - See what data flows through
4. **Use expressions** - `{{ $json.field }}` for dynamic data
5. **Handle errors** - Use "Catch" nodes for error workflows
6. **Use delays** - Add "Wait" node between rapid messages

---

## 🔗 Next Steps

- **Save your workflow** - Press Ctrl+S
- **Activate workflow** - Toggle "Active" to run automatically
- **Set up triggers** - Use Webhook, Timer, or other triggers
- **Add more nodes** - Combine with database, APIs, etc.

---

## 📞 Need Meta Credentials?

1. Go to https://business.facebook.com
2. Navigate to **WhatsApp > Getting Started**
3. Copy **Phone Number ID** and **Business Account ID**
4. Generate **Access Token** in App Settings with WhatsApp permissions

---

## ✨ That's It!

You're ready to send WhatsApp messages from n8n workflows! 🚀

Start with a simple test message and build from there.

Questions? Check the full documentation in: `WHATSAPP_NODE_README.md`
