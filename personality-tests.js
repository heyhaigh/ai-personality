import fetch from 'node-fetch';

async function test(prompt) {
  const response = await fetch('http://localhost:3000/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      stream: true
    })
  });

  let fullResponse = '';
  const reader = response.body;
  reader.setEncoding('utf8');

  for await (const chunk of reader) {
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ') && !line.includes('[DONE]')) {
        try {
          const data = JSON.parse(line.slice(6));
          const content = data.choices?.[0]?.delta?.content;
          if (content) {
            process.stdout.write(content);
            fullResponse += content;
          }
        } catch (e) {}
      }
    }
  }

  return fullResponse;
}

async function runTests() {
  const tests = [
    { name: 'Greeting Test', prompt: 'Hey! How are you?' },
    { name: 'Project Interest Test', prompt: 'I\'m building an AI-powered gardening app' },
    { name: 'NYC Test', prompt: 'What do you think about NYC pizza?' },
    { name: 'Design Background Test', prompt: 'Have you worked in design?' }
  ];

  for (const {name, prompt} of tests) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`${name}`);
    console.log(`${'='.repeat(80)}`);
    console.log(`You: ${prompt}\n`);
    console.log('Ryan: ');
    await test(prompt);
    console.log('\n');
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n✅ All personality tests complete!\n');
}

runTests();
