# Environment Configuration

This frontend application uses environment variables to configure the backend API and WebSocket connections for different environments.

## Setup

1. Create a `.env` file in the `minus-mail-frontend` directory
2. Add the following variables:

```bash
# Development (default)
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_BASE_URL=http://localhost:3000

# Production example (update with your actual domain)
# VITE_API_BASE_URL=https://api.yourdomain.com
# VITE_WS_BASE_URL=https://api.yourdomain.com
```

## Environment Variables

- `VITE_API_BASE_URL`: The base URL for the backend API endpoints
- `VITE_WS_BASE_URL`: The base URL for WebSocket connections

## Usage

- **Development**: Uses `http://localhost:3000` by default if no environment variables are set
- **Production**: Set the environment variables to your production backend URLs
- **Build**: Environment variables are embedded at build time, so make sure to set them before building

## Example Production Setup

For a production environment where your backend is at `https://api.minusmail.com`:

```bash
VITE_API_BASE_URL=https://api.minusmail.com
VITE_WS_BASE_URL=https://api.minusmail.com
```

## Building for Production

```bash
# Set environment variables and build
VITE_API_BASE_URL=https://api.yourdomain.com VITE_WS_BASE_URL=https://api.yourdomain.com npm run build
```

Or create a `.env.production` file with your production values and run:

```bash
npm run build
```

## Notes

- Environment variables must be prefixed with `VITE_` to be accessible in the frontend code
- The `.env` file should not be committed to version control (it's already in `.gitignore`)
- For different environments, you can create `.env.development`, `.env.production`, etc. 