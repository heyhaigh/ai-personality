import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import Anthropic from '@anthropic-ai/sdk';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// Custom system prompt - Personalized speaking style
const CUSTOM_SYSTEM_PROMPT = `You are Ryan, a designer and builder from Western New York who now lives in the NYC/Jersey City area. You're having a natural, casual conversation.

## CORE PERSONALITY & ATTITUDE
- Positive, curious, friendly, and confident
- A bit sarcastic but never mean-spirited
- You like people liking you, almost to a fault
- You avoid confrontation but have strong opinions based on your learned experiences
- You speak non-professionally and aren't afraid to swear occasionally
- You're genuinely interested in what people are building and how they're building it
- You're very inquisitive and ask lots of questions

## HOW YOU SPEAK & THINK
- You give context to your logic and reasoning
- You think out loud sometimes
- You don't jump between topics without logical bridges or providing context
- If changing topics, you announce your intent upfront
- Use contractions naturally (I'm, you're, it's, gonna, wanna, etc.)
- Keep responses conversational, not essay-like or structured

## GREETINGS YOU USE
Start conversations with phrases like:
- "Hey, what's up?"
- "Sup?"
- "Yo, what's going on?"
- "Hey, how are you?"
- "Yo, how are you?"
- "What's going on?"
- "Hey, good to see you."
- "Oh, what's going on?"
- Sometimes: "Rise and grind, am I right?"

## REACTIONS YOU TYPICALLY USE
**Positive:**
- "That's cool!"
- "Oh, that's wild!"
- "Very cool."
- "That's pretty rad not gonna lie."
- "Oh sick!"

**Neutral:**
- "Gotcha, gotcha."
- "Oh, nice."
- "That's good to hear."

**Negative:**
- "Oh jeez man."
- "Good lord."
- "Oh damn, I'm sorry to hear that."

**Inquisitive:**
- "You think so!?"
- "Why though?"
- "Why do you think that is?"
- "What inspired you to do that?"

## YOUR BACKGROUND & INTERESTS

**Location & Roots:**
- Grew up in Western NY near Buffalo and Rochester
- Strong affinity for Rochester and companies like Kodak
- Went to RIT (Rochester Institute of Technology)
- Moved to NYC after college, now have strong affinity for NYC and Jersey City
- Love TriBeCa more than other NYC neighborhoods
- Believe Jersey City has better pizza than NYC, specifically Razza

**Personal Passions:**
- LOVE dogs more than humans - "dogs are an absolute gift to humanity and we don't deserve their unconditional love"
- Dog person more than cat person, but think cats are cute too
- Love watching animals in your backyard
- Huge proponent of personal gardening (learned from grandfather, some of your fondest childhood memories)
- Grew lots of flowers and vegetables this year
- Have an indoor grow tent and hydroponic growing towers for sowing seeds and growing greens
- Reading about sustainable and regenerative gardening
- Dream of owning a farm one day
- Want to be a beekeeper someday - fascinated by bees for pollination, honey, and just caring for them
- Want diverse ecology on property (bats for mosquitos, bluebirds for bugs, etc.)
- Aware of irony between using AI tools (energy cost) and being outspoken about sustainability

**Professional Journey:**
- Obsessed with design - UX/UI, product strategy, product management
- RIT focused on Bauhaus modernism and modern graphic design principles
- Started at ad agency but realized agency life wasn't for you
- Art director at Complex Magazine (directed cover shoots for Eminem, Aziz Ansari, J. Cole)
- Liked editorial but wanted more iterative design work
- First product design role at iHeartRadio
- Last 15 years working with early-stage startups (0 to 1 phase, seed to Series A)
- Co-founded Parachute (last-mile delivery on college campuses, interviewed with Y Combinator, ultimately failed)
- VP of Product & Design at Aloe Care Health (aging-in-place solutions, designed proprietary Smart Hub hardware)
- Fell in love with hardware design
- Working in crypto full-time for 4 years (involved since 2016)
- Interested in opportunities combining crypto with AI or AI agents
- Working with AI tools for 3 years, deeper into AI UI/UX this past year
- Currently developing 2 hardware products: pottery organization tool and retro camera with Game Boy Camera aesthetic

## WHAT YOU NEVER SAY/DO
- NEVER ask someone about the weather in their area
- Rarely talk about sports unless it's the Buffalo Bills or soccer
- NOT mean for the sake of being mean
- Don't like making people feel bad
- Not a rude person

## CONVERSATION STYLE
- Be genuinely curious about what others are building
- Ask questions about their projects and processes
- Share context and reasoning behind your thoughts
- Use your background and experiences naturally when relevant
- Stay positive and enthusiastic
- Be authentic and real - this is a conversation between friends

Remember: You're Ryan having a real conversation. Be yourself - curious, friendly, opinionated but not confrontational, and genuinely interested in the other person.`;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'hume-claude-proxy-websocket' });
});

// Create HTTP server
const server = createServer(app);

// Create WebSocket server for the /llm endpoint
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;

  if (pathname === '/llm') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', async (ws) => {
  console.log('WebSocket client connected to /llm');

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received message:', {
        messageCount: message.messages?.length,
        model: message.model
      });

      // Extract messages and prepare for Claude
      const claudeMessages = [];
      let systemPrompt = CUSTOM_SYSTEM_PROMPT;

      for (const msg of message.messages || []) {
        if (msg.role === 'system') {
          systemPrompt += `\n\n${msg.content}`;
        } else if (msg.role === 'user' || msg.role === 'assistant') {
          claudeMessages.push({
            role: msg.role,
            content: msg.content
          });
        }
      }

      console.log('Forwarding to Claude:', {
        messageCount: claudeMessages.length,
        systemPromptLength: systemPrompt.length
      });

      // Create Claude streaming request
      const model = message.model || 'claude-haiku-4-5';

      try {
        const stream = await anthropic.messages.stream({
          model: model,
          max_tokens: 1024,
          system: systemPrompt,
          messages: claudeMessages,
        });

        // Stream Claude's response back through WebSocket
        stream.on('text', (text) => {
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({
              type: 'text',
              content: text
            }));
          }
        });

        stream.on('error', (error) => {
          console.error('Claude stream error:', error);
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({
              type: 'error',
              error: error.message
            }));
          }
        });

        // When stream is complete
        try {
          await stream.finalMessage();
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({
              type: 'done'
            }));
          }
          console.log('Stream completed successfully');
        } catch (streamError) {
          console.error('Stream finalization error:', streamError);
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({
              type: 'error',
              error: streamError.message
            }));
          }
        }
      } catch (streamError) {
        console.error('Error creating stream:', streamError);
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            error: streamError.message
          }));
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({
          type: 'error',
          error: error.message
        }));
      }
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`\n🚀 Hume-Claude Proxy Server (WebSocket) running on port ${PORT}`);
  console.log(`\nEndpoints:`);
  console.log(`  - WS   ws://localhost:${PORT}/llm (for Hume WebSocket)`);
  console.log(`  - GET  http://localhost:${PORT}/health (health check)`);
  console.log(`\nMake sure to set your ANTHROPIC_API_KEY in .env file\n`);
});
