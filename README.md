# Hume-Claude Proxy Server

A custom language model proxy for Hume AI's EVI (Empathic Voice Interface) that forwards requests to Claude with custom prompting for natural, conversational responses.

## Features

- OpenAI-compatible `/chat/completions` endpoint
- Server-Sent Events (SSE) streaming for real-time responses
- Custom system prompts for casual, conversational tone
- Easy integration with Hume AI's custom language model feature
- Built with Node.js and Express

## Prerequisites

- Node.js 18+ installed
- An Anthropic API key ([get one here](https://console.anthropic.com/))
- A Hume AI account with EVI access

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and add your API key:

```bash
cp .env.example .env
```

Then edit `.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=your_actual_api_key_here
PORT=3000
```

### 3. Run the Server Locally

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or your configured PORT).

## Deployment Options

### Option 1: Deploy to Railway

1. Create account at [railway.app](https://railway.app)
2. Click "New Project" > "Deploy from GitHub repo"
3. Connect your repository
4. Add environment variable: `ANTHROPIC_API_KEY`
5. Railway will auto-detect and deploy your Node.js app
6. Copy the generated URL (e.g., `https://your-app.railway.app`)

### Option 2: Deploy to Render

1. Create account at [render.com](https://render.com)
2. Click "New" > "Web Service"
3. Connect your repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variable: `ANTHROPIC_API_KEY`
6. Deploy and copy the URL (e.g., `https://your-app.onrender.com`)

### Option 3: Use Ngrok for Local Testing

If you want to test locally before deploying:

1. Install ngrok: `npm install -g ngrok`
2. Run your server: `npm start`
3. In another terminal: `ngrok http 3000`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

**Note**: Ngrok free tier URLs change each time you restart. For production, use a permanent deployment.

### Option 4: Deploy to Vercel

Create a `vercel.json` file:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

Then deploy:
```bash
npm install -g vercel
vercel
```

## Integrating with Hume AI

### 1. Get Your Deployed URL

After deploying using any method above, you'll have a URL like:
- Railway: `https://your-app.railway.app`
- Render: `https://your-app.onrender.com`
- Ngrok: `https://abc123.ngrok.io`

### 2. Configure in Hume AI

1. Go to [Hume AI Platform](https://platform.hume.ai/)
2. Navigate to your EVI configuration
3. In the "Language Model" section, select **"Custom Language Model"**
4. Enter your URL with the `/chat/completions` endpoint:
   ```
   https://your-app.railway.app/chat/completions
   ```
5. Save your configuration

### 3. Test Your Voice Clone

Use Hume's testing interface to verify:
- The voice clone should now respond in a casual, conversational tone
- Responses should feel more natural and human-like
- The style should match the custom prompting in `server.js`

## Customizing the Speaking Style

To modify how Claude responds, edit the `CUSTOM_SYSTEM_PROMPT` in `server.js`:

```javascript
const CUSTOM_SYSTEM_PROMPT = `You are having a natural, casual conversation...`;
```

You can adjust this prompt to:
- Change the level of formality
- Add domain-specific knowledge
- Include personality traits
- Set conversation guidelines
- Add context about your background or expertise

After editing, redeploy your server for changes to take effect.

## Monitoring and Debugging

### Check Server Health

```bash
curl https://your-deployed-url.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "hume-claude-proxy"
}
```

### View Logs

The server logs all requests. Check logs in your deployment platform:
- **Railway**: Click your service > "Deployments" > "View Logs"
- **Render**: Click your service > "Logs" tab
- **Ngrok**: Check your local terminal
- **Local**: Check the terminal where you ran `npm start`

### Test the Endpoint Directly

You can test the `/chat/completions` endpoint with curl:

```bash
curl -X POST https://your-deployed-url.com/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ],
    "stream": true
  }'
```

## Troubleshooting

### "ANTHROPIC_API_KEY not found"
- Make sure you set the environment variable in your deployment platform
- For local testing, ensure `.env` file exists with your key

### "Connection refused" or "Cannot reach endpoint"
- Verify your deployment is running (check logs)
- Ensure URL in Hume includes `/chat/completions`
- For ngrok, make sure both server and ngrok are running

### Responses are not casual enough
- Edit `CUSTOM_SYSTEM_PROMPT` in `server.js` with more specific instructions
- Redeploy after making changes

### Rate limits or API errors
- Check your Anthropic API key is valid and has credits
- Monitor usage in Anthropic Console
- Consider adding rate limiting if needed

## API Reference

### POST /chat/completions

OpenAI-compatible endpoint for chat completions.

**Request Body:**
```json
{
  "messages": [
    {"role": "user", "content": "Hello!"},
    {"role": "assistant", "content": "Hi there!"},
    {"role": "user", "content": "How are you?"}
  ],
  "stream": true,
  "model": "claude-3-5-sonnet-20241022"
}
```

**Response:** Server-Sent Events stream in OpenAI format

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "hume-claude-proxy"
}
```

## Cost Considerations

- Claude API charges based on tokens processed
- Hume AI may charge for voice cloning and EVI usage
- For production, monitor both services' usage dashboards
- Consider implementing rate limiting for cost control

## Security Notes

- Never commit your `.env` file or API keys to git
- Use environment variables for all secrets
- Consider adding authentication if exposing publicly
- Monitor for unusual usage patterns
- Rotate API keys periodically

## Support

For issues related to:
- **This proxy server**: Check the logs and troubleshooting section above
- **Hume AI**: Visit [Hume AI docs](https://dev.hume.ai) or contact support
- **Claude API**: Visit [Anthropic docs](https://docs.anthropic.com) or contact support

## License

MIT
