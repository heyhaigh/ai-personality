# Frontend Integration Guide for Tool Calling & Memory

This document explains how to integrate the Ryan voice agent's tool calling and memory persistence features with your frontend.

## Overview

The server now supports **autonomous tool calling** with persistent memory. Ryan can:
- Remember information about users across conversations
- Save and retrieve memories automatically during conversations
- Sync memory between server-side sessions and client-side localStorage

## How Tool Calling Works

### Server-Side Flow (Automatic)

1. **User speaks** → Hume sends message to `/chat/completions`
2. **Claude decides** to use a tool (e.g., `save_memory`)
3. **Server executes** the tool automatically
4. **Claude continues** the conversation with the tool results
5. **User hears** the response without knowing tools were used

**Tools are invisible to the user** - Ryan uses them naturally to remember things.

## Available Tools

### 1. `save_memory`
Saves information about the user for future conversations.

**Example:** User says "My name is Alex and I'm building a React app"
- Ryan internally calls: `save_memory("user_name", "Alex")`
- Ryan internally calls: `save_memory("current_project", "React app")`

### 2. `get_memory`
Retrieves previously saved information.

**Example:** User returns and says "Hey, what's up?"
- Ryan internally calls: `get_memory("user_name")` → "Alex"
- Ryan responds: "Hey Alex! How's the React app coming along?"

### 3. `list_memories`
Lists all stored memories for the session.

### 4. `clear_memory`
Clears specific or all memories (only when user requests).

## Session Management

### Session ID

Send a `session_id` in your requests to maintain memory across conversations:

```javascript
const response = await fetch('https://your-railway-url.app/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [...],
    session_id: 'user_123' // Persist this per user
  })
});
```

**Without a session_id:** Server generates a new one each time (no memory persistence).

**With a session_id:** Server remembers everything for that session.

## Memory Sync API (Optional)

You can sync server-side memory with client-side localStorage for offline access or backup.

### Get Memory
```javascript
// Get all memories for a session
const response = await fetch(`https://your-railway-url.app/memory/user_123`);
const { memories } = await response.json();
// memories = { user_name: "Alex", current_project: "React app", ... }

// Save to localStorage
localStorage.setItem('ryan_memories', JSON.stringify(memories));
```

### Set Memory
```javascript
// Load from localStorage and sync to server
const localMemories = JSON.parse(localStorage.getItem('ryan_memories') || '{}');

await fetch(`https://your-railway-url.app/memory/user_123`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ memories: localMemories })
});
```

### Clear Memory
```javascript
// Clear specific memory
await fetch(`https://your-railway-url.app/memory/user_123/user_name`, {
  method: 'DELETE'
});

// Clear all memories
await fetch(`https://your-railway-url.app/memory/user_123`, {
  method: 'DELETE'
});
```

## Frontend Implementation Example

### Basic Setup (No localStorage)

```javascript
// Simple setup - memory only persists on server during session
const sessionId = `user_${Date.now()}`;

// Use sessionId in all Hume requests
// The server handles everything else automatically
```

### Advanced Setup (With localStorage Sync)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Ryan Voice Agent</title>
</head>
<body>
  <button id="startCall">Start Call</button>
  <button id="clearMemory">Clear Memories</button>

  <script>
    const SERVER_URL = 'https://your-railway-url.app';
    const SESSION_ID = 'user_' + (localStorage.getItem('user_id') || Date.now());

    // Save session ID
    if (!localStorage.getItem('user_id')) {
      localStorage.setItem('user_id', SESSION_ID);
    }

    // Load memories from localStorage on page load
    async function initMemory() {
      const localMemories = JSON.parse(localStorage.getItem('ryan_memories') || '{}');

      // Sync to server
      await fetch(`${SERVER_URL}/memory/${SESSION_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memories: localMemories })
      });
    }

    // Periodically sync server memory to localStorage
    async function syncMemoryToLocal() {
      const response = await fetch(`${SERVER_URL}/memory/${SESSION_ID}`);
      const { memories } = await response.json();
      localStorage.setItem('ryan_memories', JSON.stringify(memories));
    }

    // Clear all memories
    async function clearMemories() {
      await fetch(`${SERVER_URL}/memory/${SESSION_ID}`, { method: 'DELETE' });
      localStorage.removeItem('ryan_memories');
      alert('Memories cleared!');
    }

    // Initialize on page load
    initMemory();

    // Sync every 30 seconds
    setInterval(syncMemoryToLocal, 30000);

    document.getElementById('clearMemory').addEventListener('click', clearMemories);

    document.getElementById('startCall').addEventListener('click', async () => {
      // Your Hume EVI integration here
      // Make sure to pass session_id in requests:

      // Example with Hume SDK (pseudocode):
      // await humeClient.connect({
      //   customLLM: {
      //     url: `${SERVER_URL}/chat/completions`,
      //     session_id: SESSION_ID  // Include this!
      //   }
      // });
    });
  </script>
</body>
</html>
```

## Testing Tool Calling

### Test Conversation Flow

1. **First conversation:**
   ```
   User: "Hey, I'm Sarah and I'm working on a Next.js project"
   Ryan: "Hey Sarah! Very cool, what are you building with Next.js?"
   ```
   *(Ryan saves: user_name="Sarah", current_project="Next.js project")*

2. **Later conversation (same session_id):**
   ```
   User: "What was I working on again?"
   Ryan: "You're working on a Next.js project. How's it going?"
   ```
   *(Ryan retrieved the memory!)*

### Test Memory API

```bash
# Save memory
curl -X POST https://your-railway-url.app/memory/test_session \
  -H "Content-Type: application/json" \
  -d '{"memories": {"user_name": "Test User", "favorite_lang": "TypeScript"}}'

# Get memory
curl https://your-railway-url.app/memory/test_session

# Clear specific memory
curl -X DELETE https://your-railway-url.app/memory/test_session/user_name

# Clear all
curl -X DELETE https://your-railway-url.app/memory/test_session
```

## Session Timeout

- **Server-side memory persists for 1 hour** after last access
- Sessions are cleaned up automatically every 10 minutes
- Use localStorage sync to preserve beyond server timeout

## Best Practices

1. **Generate consistent session IDs** - Use user IDs, device IDs, or persistent random IDs
2. **Sync memory periodically** - Keep localStorage and server in sync
3. **Handle memory gracefully** - Don't rely on memory being there (user might clear it)
4. **Privacy** - Give users a way to clear their memories
5. **Don't overuse** - Let Ryan decide what's worth remembering

## Architecture Diagram

```
┌─────────────┐
│   Frontend  │
│             │
│ localStorage│ ◄──── Sync ────► ┌──────────────┐
│  (Optional) │                  │    Server    │
└─────────────┘                  │              │
                                 │  sessionMap  │
      ▲                          │  ┌────────┐  │
      │                          │  │Session │  │
      │ SSE Stream               │  │memories│  │
      │ (text only)              │  └────────┘  │
      │                          │              │
      │                          │   Claude     │
      │                          │   ┌──────┐   │
      └────────────────────────── │  │Tools │   │
           Chat responses         │  └──────┘   │
                                 └──────────────┘
```

## Summary

- **Server handles tool calling automatically** - No frontend changes needed for basic memory
- **Memory persists per session_id** - Use consistent IDs across conversations
- **localStorage sync is optional** - Use it for offline backup and cross-device sync
- **Tools are invisible to users** - Ryan uses them naturally in conversation

Pass this guide to your frontend session for implementation!
