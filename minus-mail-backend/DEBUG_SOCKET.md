# Socket Connection Debugging Guide

## Quick Tests

### 1. Test Backend Health
```bash
curl http://localhost:3005/email/health
```

### 2. Test WebSocket Gateway
```bash
curl http://localhost:3005/email/test/websocket
```

### 3. Test Socket Connection
```bash
node test-socket.js
```

## Common Issues & Solutions

### Issue 1: Backend Not Starting
**Symptoms**: Backend fails to start or crashes
**Solution**: 
- Check Redis is running: `redis-cli ping`
- Check port 3005 is available: `lsof -i :3005`
- Check logs for module import errors

### Issue 2: CORS Errors
**Symptoms**: Frontend can't connect, CORS errors in browser console
**Solution**: 
- Verify CORS is enabled in main.ts
- Check frontend is connecting to correct URL
- Ensure credentials are properly configured

### Issue 3: Redis Connection Issues
**Symptoms**: Backend starts but Redis subscription fails
**Solution**:
- Verify Redis is running: `redis-server --version`
- Check Redis connection: `redis-cli ping`
- Restart Redis if needed: `sudo systemctl restart redis`

### Issue 4: Module Import Errors
**Symptoms**: Backend fails to start with import errors
**Solution**:
- Check all modules are properly exported
- Verify EmailModule is imported in AppModule
- Check EmailGateway has proper dependencies

## Debugging Steps

### Step 1: Check Backend Logs
```bash
cd minus-mail-backend
npm run start:dev
```

Look for:
- `=== EMAIL GATEWAY: Initializing ===`
- `=== EMAIL GATEWAY: Redis subscription set up successfully ===`
- `WebSocket support enabled`

### Step 2: Test API Endpoints
```bash
# Health check
curl http://localhost:3005/email/health

# WebSocket test
curl http://localhost:3005/email/test/websocket
```

### Step 3: Test Socket Connection
```bash
# Install socket.io-client if needed
npm install socket.io-client

# Run test script
node test-socket.js
```

### Step 4: Check Frontend Connection
1. Open browser developer tools
2. Go to Network tab
3. Look for WebSocket connections
4. Check for any error messages

## Expected Logs

### Backend Startup
```
Starting application...
=== EMAIL PROCESSOR: Service initialized and ready to process emails ===
=== EMAIL GATEWAY: Initializing ===
=== EMAIL GATEWAY: Setting up Redis subscription ===
=== EMAIL GATEWAY: Redis subscriber connected ===
=== EMAIL GATEWAY: Redis subscription set up successfully ===
API Gateway running on port 3005
WebSocket support enabled
CORS enabled for all origins
```

### Client Connection
```
=== CLIENT CONNECTED ===
Client ID: [socket-id]
Client transport: websocket
Total connected clients: 1
Server ready state: 1
```

### Join Request
```
=== JOIN REQUEST RECEIVED ===
Client ID: [socket-id]
Email ID: test
Client transport: websocket
Client joined room: test
Clients in room test: 1
```

## Troubleshooting Commands

```bash
# Check if Redis is running
redis-cli ping

# Check if port 3005 is in use
lsof -i :3005

# Kill process on port 3005 if needed
sudo kill -9 $(lsof -t -i:3005)

# Check backend logs
tail -f minus-mail-backend/logs/app.log

# Test Redis pub/sub
redis-cli
> PUBLISH new-email '{"username":"test","emailId":"123","email":{"from":"test@example.com","subject":"Test"}}'
``` 