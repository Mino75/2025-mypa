# 🤖 MyPA - My Personal Assistant

## 📋 Table of Contents
- [📖 About](#-about)
- [🚀 Getting Started](#-getting-started)
- [🔨 How to Build / How to Run](#-how-to-build--how-to-run)
- [🏗️ Project Structure](#️-project-structure)
- [🎯 Features](#-features)
- [📚 Dependencies](#-dependencies)
- [🐳 Docker Deployment](#-docker-deployment)
- [💡 Usage](#-usage)
- [⚙️ Configuration](#️-configuration)
- [🔧 Service Worker](#-service-worker)
- [📱 Progressive Web App](#-progressive-web-app)
- [📄 License](#-license)

## 📖 About
MyPA (My Personal Assistant) is an offline-first Progressive Web App that serves as a personal dashboard for managing and accessing multiple authorized websites through a unified interface. Built with vanilla JavaScript and Express.js, it provides a multi-screen layout system that works entirely offline with advanced caching capabilities.

## 🚀 Getting Started

### Prerequisites
- Node.js (v22 or higher)
- npm package manager
- Modern web browser with Service Worker support
- Docker (optional, for containerized deployment)

### 📦 Installation
```bash
git clone <repository-url>
cd mypa
npm install
```

## 🔨 How to Build / How to Run

### Development Mode
```bash
# Start the development server
node server.js
```
The application will be available at `http://localhost:3000`

### Production Mode
```bash
# Install production dependencies
npm install --omit=dev

# Set environment variables (optional)
export AUTHORIZED_SITES="https://example1.com,https://example2.com"
export PORT=3000

# Start the server
node server.js
```

## 🏗️ Project Structure
```
mypa/
├── index.html              # Main application interface with template injection
├── server.js               # Express server with environment variable injection
├── main.js                 # Core application logic and screen management
├── styles.js               # Responsive CSS-in-JS styling system
├── db.js                   # IndexedDB database operations
├── service-worker.js       # Advanced offline caching strategy
├── manifest.json           # PWA manifest configuration
├── authorized-sites.json   # Default authorized websites list
├── package.json            # Node.js dependencies and metadata
├── package-lock.json       # Dependency lock file
├── Dockerfile              # Multi-stage Docker build configuration
├── .gitignore             # Git ignore patterns
└── .github/workflows/      # CI/CD automation
    └── main.yml           # Docker Hub deployment workflow
```

## 🎯 Features

### 🖥️ Multi-Screen Interface
- **1-4 Screen Layouts**: Desktop grid layouts for productivity
- **20 Screen Grid**: Thumbnail view for quick overview
- **Responsive Design**: Mobile-optimized with collapsible sidebar
- **Dynamic Screen Generation**: Runtime screen creation with unique anchors

### 🌐 Website Management
- **Authorized Sites**: JSON and environment-based site configuration
- **Smart URL Display**: Intelligent site name extraction and formatting
- **Site Merging**: Automatic combination of JSON and environment sources
- **Dropdown Navigation**: Organized site selection per screen

### 📱 Mobile Optimization
- **Collapsible Sidebar**: Header-style navigation for mobile devices
- **Touch-Friendly**: Large touch targets and intuitive gestures
- **Scroll Navigation**: Up/down navigation buttons for easy browsing
- **Responsive Grids**: Adaptive layouts for all screen sizes

### 💾 Offline Capabilities
- **Advanced Service Worker**: Atomic cache updates with rollback protection
- **IndexedDB Storage**: Persistent local data storage
- **Cache Management**: User-initiated cache clearing functionality
- **Offline-First**: Full functionality without internet connection

### 🔧 Progressive Web App
- **Installable**: Add to home screen functionality
- **App Icons**: 192x192 and 512x512 icon support
- **Standalone Mode**: Native app-like experience
- **Background Updates**: Automatic cache refreshing

## 📚 Dependencies

### Runtime Dependencies
- **Express**: `^4.18.2` - Lightweight web server framework
- **Node.js**: `v22-alpine` - Runtime environment

### Client-Side Features
- **Vanilla JavaScript**: No external client-side frameworks
- **CSS-in-JS**: Dynamic styling system
- **IndexedDB**: Browser-native database
- **Service Worker API**: Advanced caching and offline support

## 🐳 Docker Deployment

### Build Docker Image
```bash
docker build -t mypa:latest .
```

### Run Container
```bash
# Basic deployment
docker run -p 3000:3000 mypa:latest

# With environment variables
docker run -p 3000:3000 \
  -e AUTHORIZED_SITES="https://site1.com,https://site2.com" \
  -e NODE_ENV=production \
  mypa:latest
```

### Docker Configuration
- **Base Image**: Node.js 22 Alpine Linux
- **Multi-stage Build**: Optimized production image
- **Port Exposure**: 3000
- **Environment Variables**: Configurable authorized sites
- **Production Optimized**: Minimal image size with security best practices

### Automated Deployment
GitHub Actions workflow automatically builds and pushes to Docker Hub on manual trigger:
```bash
# Trigger manual build
gh workflow run main.yml
```

## 💡 Usage

### 🖱️ Desktop Interface
1. **Select Layout**: Choose 1-4 screens or 20-screen grid view
2. **Add Sites**: Use dropdown menus to select authorized websites
3. **Navigate**: Each screen loads websites in isolated iframes
4. **Manage Cache**: Clear cache when needed for updates

### 📱 Mobile Interface
1. **Access Menu**: Tap hamburger icon (☰) to open navigation
2. **Choose Layout**: Select screen configuration from dropdown menu
3. **Navigate Sites**: Scroll through screens vertically
4. **Quick Navigation**: Use up/down arrow buttons for rapid scrolling

### 🔧 Site Configuration
#### JSON Configuration (`authorized-sites.json`)
```json
{
  "sites": [
    "https://example1.com/",
    "https://example2.com/",
    "https://subdomain.example.com/"
  ]
}
```

#### Environment Variables
```bash
export AUTHORIZED_SITES="https://site1.com,https://site2.com,https://site3.com"
```

### 📊 Site Name Display Logic
- **GitHub Pages**: Extracts repository name from `.github.io` URLs
- **Subdomains**: Uses subdomain as display name
- **Standard Sites**: Uses domain without TLD for clean display

## ⚙️ Configuration

### Environment Variables
| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `PORT` | Server port | `3000` | `8080` |
| `AUTHORIZED_SITES` | Comma-separated site URLs | `"https://hongkoala.com/"` | `"https://site1.com,https://site2.com"` |
| `NODE_ENV` | Environment mode | `development` | `production` |

### Dynamic Injection
The server dynamically injects environment variables into the HTML template:
```html
<script>
  window.authorizedSitesFromEnv = "${AUTHORIZED_SITES}";
</script>
```

## 🔧 Service Worker

### Advanced Caching Strategy
- **Atomic Updates**: Complete cache replacement or rollback
- **Staged Installation**: Temporary cache validation before promotion
- **Network-First**: Fresh content with offline fallback
- **Asset Preloading**: Critical resources cached on install

### Cache Management
```javascript
// Cache versioning
const LIVE_CACHE = 'character-trainer-v1';
const TEMP_CACHE = 'character-trainer-temp-v1';

// Cached assets
const ASSETS = [
  '/', '/index.html', '/styles.js', '/main.js',
  '/db.js', '/manifest.json', '/favicon.ico',
  '/logo.webp', '/authorized-sites.json'
];
```

## 📱 Progressive Web App

### PWA Features
- **Offline Functionality**: Complete app works without internet
- **Installable**: Add to home screen on mobile and desktop
- **App Shell**: Fast loading core interface
- **Background Sync**: Automatic updates when connection restored

### Mobile Optimizations
- **Touch Navigation**: Gesture-friendly interface
- **Viewport Adaptation**: Responsive design for all screen sizes
- **Performance**: Optimized for mobile browsers
- **Battery Efficient**: Minimal resource usage

### Analytics Integration
- **Privacy-Focused**: Optional analytics with user consent
- **Performance Tracking**: Core Web Vitals monitoring
- **Usage Insights**: Screen layout preferences and site access patterns

## 📄 License
MIT License

Copyright (c) 2021 Mino

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.

