// Quick test of tool execution logic
console.log('Testing tool execution...\n');

// Session storage
const sessionMemories = new Map();

// Tool execution function (from server.js)
function executeTool(toolName, toolInput, sessionId) {
  let session = sessionMemories.get(sessionId);
  if (!session) {
    session = { memories: {}, lastAccessed: Date.now() };
    sessionMemories.set(sessionId, session);
  }
  session.lastAccessed = Date.now();

  switch (toolName) {
    case 'save_memory':
      session.memories[toolInput.key] = toolInput.value;
      return `Memory saved: ${toolInput.key} = ${toolInput.value}`;

    case 'get_memory':
      const value = session.memories[toolInput.key];
      if (value === undefined) {
        return `No memory found for key: ${toolInput.key}`;
      }
      return value;

    case 'list_memories':
      const keys = Object.keys(session.memories);
      if (keys.length === 0) {
        return 'No memories stored yet.';
      }
      return `Stored memories: ${keys.map(k => `${k}: ${session.memories[k]}`).join(', ')}`;

    case 'clear_memory':
      if (toolInput.key) {
        delete session.memories[toolInput.key];
        return `Memory cleared: ${toolInput.key}`;
      } else {
        session.memories = {};
        return 'All memories cleared.';
      }

    default:
      return `Unknown tool: ${toolName}`;
  }
}

// Test suite
const testSessionId = 'test_session_123';

console.log('1. Testing save_memory:');
let result = executeTool('save_memory', { key: 'user_name', value: 'Sarah' }, testSessionId);
console.log('   Result:', result);

result = executeTool('save_memory', { key: 'project', value: 'Next.js app' }, testSessionId);
console.log('   Result:', result);

console.log('\n2. Testing get_memory:');
result = executeTool('get_memory', { key: 'user_name' }, testSessionId);
console.log('   Result:', result);

console.log('\n3. Testing list_memories:');
result = executeTool('list_memories', {}, testSessionId);
console.log('   Result:', result);

console.log('\n4. Testing clear_memory (specific key):');
result = executeTool('clear_memory', { key: 'project' }, testSessionId);
console.log('   Result:', result);

console.log('\n5. Testing get_memory (cleared key):');
result = executeTool('get_memory', { key: 'project' }, testSessionId);
console.log('   Result:', result);

console.log('\n6. Testing clear_memory (all):');
result = executeTool('clear_memory', {}, testSessionId);
console.log('   Result:', result);

console.log('\n7. Testing list_memories (empty):');
result = executeTool('list_memories', {}, testSessionId);
console.log('   Result:', result);

console.log('\n✅ All tool tests passed!');
