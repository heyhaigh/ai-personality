import fetch from 'node-fetch';

// Test the chat completions endpoint
async function testConversation(messages) {
  const response = await fetch('http://localhost:3000/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      stream: true,
      model: 'claude-sonnet-4-5-20250929'
    })
  });

  console.log('\n' + '='.repeat(80));
  console.log('Response:');
  console.log('='.repeat(80));

  let fullResponse = '';

  // Parse SSE stream
  const reader = response.body;
  reader.setEncoding('utf8');

  for await (const chunk of reader) {
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          continue;
        }
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            process.stdout.write(content);
            fullResponse += content;
          }
        } catch (e) {
          // Skip parsing errors
        }
      }
    }
  }

  console.log('\n' + '='.repeat(80) + '\n');
  return fullResponse;
}

// Test scenarios
const testScenarios = [
  {
    name: 'Greeting Test',
    messages: [
      { role: 'user', content: 'Hey! How are you doing?' }
    ]
  },
  {
    name: 'Project Interest Test',
    messages: [
      { role: 'user', content: 'Hey! I\'m building a new AI-powered tool for gardeners.' }
    ]
  },
  {
    name: 'Design Question Test',
    messages: [
      { role: 'user', content: 'What do you think about using Bauhaus principles in modern web design?' }
    ]
  },
  {
    name: 'Personal Interest Test',
    messages: [
      { role: 'user', content: 'I just got a new puppy!' }
    ]
  }
];

async function runTests() {
  console.log('Testing personalized conversation style...\n');

  for (const scenario of testScenarios) {
    console.log(`\n${'#'.repeat(80)}`);
    console.log(`TEST: ${scenario.name}`);
    console.log(`${'#'.repeat(80)}`);
    console.log(`User: ${scenario.messages[0].content}`);

    await testConversation(scenario.messages);

    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n✅ All tests complete!\n');
}

runTests().catch(console.error);
