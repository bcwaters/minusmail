# MinusMail Frontend

A React-based frontend for the MinusMail ephemeral email service. This application provides a real-time email inbox interface with advanced filtering and routing capabilities.

## Features

- **Real-time Email Delivery**: Receive emails instantly via WebSocket connection
- **URL-based Routing**: Access different inboxes via URL parameters
- **Hostname Filtering**: Filter emails by sender domain with query parameters
- **Ephemeral Storage**: Emails automatically expire after 15 minutes
- **Email Download**: Download emails as HTML files
- **Responsive Design**: Modern UI with clean, intuitive interface

## Routing

The application supports URL-based routing to access different email inboxes and apply filters.

### Basic Routing

- **`/`** - Default inbox (uses fallback email address)
- **`/:username`** - Inbox for specific username

### Examples

```
http://localhost:5173/           # Default inbox
http://localhost:5173/test       # Inbox for "test" username
http://localhost:5173/john       # Inbox for "john" username
http://localhost:5173/admin      # Inbox for "admin" username
```

### Filtering with Query Parameters

You can filter emails by sender hostname using the `filter` query parameter:

- **`?filter=hostname`** - Filter emails by sender domain

### Filter Examples

```
http://localhost:5173/test?filter=facebook    # Only Facebook emails for "test"
http://localhost:5173/john?filter=google      # Only Google emails for "john"
http://localhost:5173/admin?filter=github     # Only GitHub emails for "admin"
http://localhost:5173/user?filter=gmail       # Only Gmail emails for "user"
```

### URL Synchronization

- The URL updates automatically as you type in the filter input
- Filter state persists across page refreshes
- Shareable URLs for specific filtered views
- Clear filter removes the query parameter from the URL

## Email Filtering

### Filter Input
- Type any part of a hostname to filter emails
- Case-insensitive matching
- Real-time filtering as you type
- Clear button (✕) to reset filter

### Filter Logic
- Extracts hostname from sender email (everything after @)
- Partial matching (typing "face" matches "facebook.com")
- Updates inbox count to show filtered vs total emails

## Development

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
cd minus-mail-frontend
npm install
```

### Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── components/          # React components
│   ├── AppBanner.tsx   # Top banner with email controls
│   ├── CurrentAddress.tsx # Current email address display
│   ├── EmailDisplay.tsx # Email content viewer
│   ├── EmailInput.tsx  # Email address input
│   ├── Inbox.tsx       # Email list with filtering
│   └── ...
├── services/           # API and WebSocket services
│   ├── ApiService.ts   # REST API client
│   └── SocketService.ts # WebSocket client
├── config/            # Configuration files
└── App.tsx           # Main application component
```

## API Integration

The frontend connects to the MinusMail backend API for:
- Fetching email lists
- Real-time email delivery via WebSocket
- Email management operations

### WebSocket Events
- `newEmail` - Receives new email data in real-time
- Automatic reconnection on connection loss

## Styling

The application uses CSS modules for component-specific styling:
- Consistent color scheme with orange accent (#FBA43F)
- Responsive design for different screen sizes
- Hover effects and smooth transitions
- Clean, modern interface design

## Browser Support

- Modern browsers with ES6+ support
- WebSocket support required for real-time features
- Local storage for user preferences

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the MinusMail ephemeral email service.
