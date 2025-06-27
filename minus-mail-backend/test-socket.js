const io = require('socket.io-client');

console.log('Testing WebSocket connection...');

const socket = io('http://localhost:3000', {
  transports: ['polling', 'websocket'],
  timeout: 20000
});

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server');
  console.log('Socket ID:', socket.id);
  
  // Test ping
  socket.emit('ping', (response) => {
    console.log('✅ Ping response:', response);
  });
  
  // Test join
  socket.emit('join', 'test', (response) => {
    console.log('✅ Join response:', response);
  });
  
  // Disconnect after tests
  setTimeout(() => {
    socket.disconnect();
    console.log('✅ Tests completed, disconnecting');
  }, 2000);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.log('❌ Connection error:', error.message);
});

socket.on('new-email', (email) => {
  console.log('📧 New email received:', email);
});

// Timeout after 10 seconds
setTimeout(() => {
  if (socket.connected) {
    socket.disconnect();
  }
  console.log('❌ Test timeout');
  process.exit(1);
}, 10000); 