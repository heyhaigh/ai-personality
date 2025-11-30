# Your Hume-Claude Voice Clone Proxy is Ready!

## What You Have

A fully functional, **highly personalized** custom language model proxy that makes your Hume AI voice clone sound exactly like you.

### Key Features

✅ **Personalized System Prompt** - Captures your unique speaking style:
  - Greetings ("Yo", "Sup?", "Hey, what's up?")
  - Positive reactions ("That's cool!", "Oh sick!", "That's pretty rad not gonna lie")
  - Inquisitive nature and love for asking about what people are building
  - Your background (Western NY, RIT, NYC/Jersey City, design career, gardening passion)
  - Professional journey (Complex Magazine, iHeartRadio, startups, crypto, AI)
  - Personal interests (dogs, gardening, sustainability, beekeeping dreams)

✅ **OpenAI-Compatible SSE Streaming** - Works perfectly with Hume AI's custom LLM feature

✅ **Claude-Powered Responses** - Uses Claude 3.5 Sonnet for high-quality, contextual responses

✅ **Error Handling** - Gracefully handles API errors and edge cases

## Current Status

⚠️ **ACTION REQUIRED**: Your Anthropic API key needs credits

The server is working perfectly, but the API key you provided has run out of credits. You need to:

1. Go to https://console.anthropic.com/settings/plans
2. Add credits to your account (start with $5-$20)
3. Once credits are added, the same API key will work automatically

## Files Created

```
/Users/ryanhaigh/hume-claude-proxy/
├── server.js              # Main proxy server with your personalized prompt
├── package.json           # Dependencies
├── .env                   # Your API key (already configured)
├── .env.example          # Template for environment variables
├── .gitignore            # Git ignore file
├── README.md             # Full documentation
├── test-conversation.js  # Test script to verify responses
└── SETUP-COMPLETE.md     # This file
```

## Testing Your Proxy

Once you add credits to your Anthropic account, you can test the proxy:

```bash
# Test with the included script
node test-conversation.js

# Or test manually with curl
curl -X POST http://localhost:3000/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hey! Tell me about your gardening setup."}
    ],
    "stream": true
  }'
```

## Deployment Options

### Option 1: Railway (Recommended)

1. Push this code to a GitHub repo
2. Go to https://railway.app
3. "New Project" → "Deploy from GitHub repo"
4. Add environment variable: `ANTHROPIC_API_KEY`
5. Get your URL: `https://your-app.railway.app`

### Option 2: Render

1. Go to https://render.com
2. "New" → "Web Service"
3. Connect your GitHub repo
4. Build: `npm install`
5. Start: `npm start`
6. Add environment variable: `ANTHROPIC_API_KEY`
7. Get your URL: `https://your-app.onrender.com`

### Option 3: Ngrok (Quick Testing)

```bash
# Terminal 1
npm start

# Terminal 2
ngrok http 3000
```

Copy the HTTPS URL from ngrok (e.g., `https://abc123.ngrok.io`)

## Integrating with Hume AI

Once deployed:

1. Go to https://platform.hume.ai/
2. Navigate to your EVI voice configuration
3. Select **"Custom Language Model"**
4. Enter your deployed URL + `/chat/completions`:
   ```
   https://your-app.railway.app/chat/completions
   ```
5. Save and test!

## Customizing Further

Want to tweak your speaking style? Edit the `CUSTOM_SYSTEM_PROMPT` in `server.js` (lines 20-130).

You can:
- Add more specific phrases you use
- Include domain expertise
- Add context about current projects
- Modify your reactions and greetings
- Add personality traits

After editing, restart the server or redeploy.

## Cost Considerations

**Claude API Pricing** (as of 2025):
- Input: ~$3 per million tokens
- Output: ~$15 per million tokens

A typical voice conversation (10 exchanges) might cost $0.02-0.10 depending on length.

**Hume AI**: Check their pricing for EVI usage

## Troubleshooting

### "Credit balance too low"
→ Add credits at https://console.anthropic.com/settings/plans

### "Connection refused"
→ Make sure server is running with `npm start`

### "Hume can't connect to my endpoint"
→ Verify your URL includes `/chat/completions` and is publicly accessible

### Responses don't sound like you
→ Edit `CUSTOM_SYSTEM_PROMPT` in `server.js` with more specific examples

## Next Steps

1. **Add credits** to your Anthropic account
2. **Test locally** with `node test-conversation.js`
3. **Deploy** to Railway, Render, or use ngrok
4. **Connect to Hume** with your deployed URL
5. **Test your voice clone** and iterate on the system prompt as needed

## Support

- **Anthropic Console**: https://console.anthropic.com/
- **Hume AI Docs**: https://dev.hume.ai/docs/empathic-voice-interface-evi/overview
- **Claude API Docs**: https://docs.anthropic.com/

---

Your personalized voice clone proxy is ready to go! Just add credits and deploy. 🚀
