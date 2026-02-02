# WhatsApp Node for n8n

A powerful n8n node for sending WhatsApp messages with interactive buttons through the Facebook Graph API.

## Features

- **Send Text Messages**: Simple text messages via WhatsApp
- **Interactive Button Messages**: Send messages with up to multiple reply buttons
- **Emoji Support**: Full support for emoji in messages and button titles
- **Dynamic Phone Numbers**: Support for expressions to make phone numbers dynamic
- **Easy Button Configuration**: Simple UI to add/remove buttons without writing code

## Installation

1. Build the project:
```bash
npm run build
```

2. Link it to your n8n installation:
```bash
npm link
cd ~/.n8n/custom
npm link n8n-nodes-whatsapp-button
n8n start
```

## Configuration

### Credentials Setup

1. Go to **Credentials** in n8n
2. Create a new **WhatsApp API** credential
3. Fill in the required fields:
   - **Phone Number ID**: Your WhatsApp Phone Number ID (found in Meta Business Manager)
   - **Business Account ID**: Your WhatsApp Business Account ID
   - **Access Token**: Your Meta Access Token with WhatsApp permissions

To get these credentials:
1. Go to [Meta Business Manager](https://business.facebook.com)
2. Navigate to WhatsApp -> Getting Started
3. Copy your Phone Number ID and Business Account ID
4. Generate an Access Token with WhatsApp permissions

## Usage

### Operation 1: Send Message with Buttons

Ideal for presenting options to users.

**Fields:**
- **Phone Number**: Recipient's phone number (e.g., `+1234567890` or use expression `{{ $json.phone }}`)
- **Message Text**: The main message body (supports emoji and multi-line)
- **Buttons**: Add up to 3-10 buttons (depends on API version)
  - **Button ID**: Unique identifier returned when button is clicked
  - **Button Title**: Display text (max 20 characters, supports emoji)

**Example payload:**
```json
{
  "messaging_product": "whatsapp",
  "to": "+1234567890",
  "type": "interactive",
  "interactive": {
    "type": "button",
    "body": {
      "text": "What would you like to update? ✏️"
    },
    "action": {
      "buttons": [
        {
          "type": "reply",
          "reply": {
            "id": "btn_find_attractions",
            "title": "Find Attractions 🎡"
          }
        },
        {
          "type": "reply",
          "reply": {
            "id": "btn_change_flight",
            "title": "Change Flight ✈️"
          }
        },
        {
          "type": "reply",
          "reply": {
            "id": "btn_change_hotel",
            "title": "Change Hotel 🏨"
          }
        }
      ]
    }
  }
}
```

### Operation 2: Send Text Message

Simple text-only messages.

**Fields:**
- **Phone Number**: Recipient's phone number
- **Message Text**: The message to send

**Example payload:**
```json
{
  "messaging_product": "whatsapp",
  "to": "+1234567890",
  "type": "text",
  "text": {
    "body": "Hello! This is a text message."
  }
}
```

## Examples

### Example 1: Send Message with Dynamic Phone Number

Use this in a workflow with data from a previous node:

```
Input Node (gets contact data)
      ↓
WhatsApp Node:
  - Phone Number: {{ $json.phone }}
  - Message Text: Hello {{ $json.name }}!
  - Buttons: Find Attractions, Change Flight
```

### Example 2: Conditional Button Messages

Use conditional routing to send different messages based on status:

```
Check Status
    ↓
If status = "pending" → Send "What would you like to update?" with buttons
If status = "completed" → Send "Thank you!" with no buttons
```

### Example 3: Conversation Flow

Create a multi-step conversation:

1. Send message with buttons (Find Flights, Change Hotel, etc.)
2. User clicks button → Button ID is returned
3. Use Switch node to route based on button ID
4. Send follow-up messages accordingly

## Response Format

When a message is sent successfully, the API returns:

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
      "id": "wamid.xxxxx"
    }
  ]
}
```

## Button Limitations

- Maximum 3 buttons per message (can be extended to 10 depending on API version)
- Button title: max 20 characters
- Button ID: used to identify which button was clicked
- Buttons appear as reply options in WhatsApp client

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid phone number | Format incorrect | Use format with country code: +1234567890 |
| Invalid access token | Token expired or wrong | Regenerate token in Meta Business Manager |
| Rate limited | Too many messages | Add delay between messages using Wait node |
| Message too long | Text exceeds limits | Reduce message text length |
| Invalid credentials | Phone ID or Account ID wrong | Verify IDs in Meta Business Manager |

## Best Practices

1. **Always validate phone numbers** - Check format before sending
2. **Use expressions for dynamic data** - `{{ $json.phone }}` instead of hardcoding
3. **Test credentials** - Use the credential test before running workflows
4. **Add delays** - Use Wait node between rapid messages to avoid rate limits
5. **Handle responses** - Check API response for errors
6. **Use meaningful button IDs** - Makes tracking user actions easier

## API Reference

- Base URL: `https://graph.facebook.com`
- Endpoint: `/v22.0/{PHONE_NUMBER_ID}/messages`
- Method: `POST`
- Authentication: Bearer token in Authorization header

For more details, visit: [WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)

## Troubleshooting

### Messages not being sent?
- Check credentials are correct
- Verify phone number format includes country code
- Ensure access token has WhatsApp permissions
- Check Message Templates are approved (if using templates)

### Buttons not appearing?
- Verify all buttons have unique IDs
- Keep button titles under 20 characters
- Check maximum 3 buttons are being used

### Node not showing in n8n?
- Run `npm run build`
- Restart n8n after linking
- Check package.json includes the node in "nodes" array

## Contributing

To improve this node:
1. Make changes to the TypeScript files
2. Run `npm run lint:fix` to fix formatting
3. Run `npm run build` to compile
4. Test in your n8n instance

## License

MIT
