import fetch from 'node-fetch';

async function simpleTest() {
  console.log('Testing Hume-Claude Proxy...\n');

  try {
    const response = await fetch('http://localhost:3000/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hey! Tell me about your love for dogs in one sentence.' }],
        stream: true
      })
    });

    console.log('Response received! Streaming...\n');

    const reader = response.body;
    reader.setEncoding('utf8');

    for await (const chunk of reader) {
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
          try {
            const data = JSON.parse(line.slice(6));
            const content = data.choices?.[0]?.delta?.content;
            if (content) process.stdout.write(content);
          } catch (e) {}
        }
      }
    }

    console.log('\n\n✅ Test complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

simpleTest();
