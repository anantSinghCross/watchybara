# Watchybara 🦥

> **Co-watch videos with friends in real-time!**

Watchybara is a browser extension that enables you to watch videos together with your friends while maintaining synchronized playback. Whether you're watching Netflix, Prime Video, or any other streaming platform, Watchybara keeps everyone in sync and provides a video chat interface for a truly social viewing experience.

![Watchybara Demo](assets/icon.png)

## ✨ Features

### 🎬 Synchronized Video Playback

- **Real-time sync**: When one person plays, pauses, or seeks, everyone's video stays synchronized
- **Multi-platform support**: Works with Netflix, Prime Video, and other streaming platforms
- **Automatic detection**: Automatically detects video elements on the page
- **Manual sync**: "Sync Now" button to manually synchronize playback if needed

### 📹 Video Chat Interface

- **Face-to-face chat**: Built-in video calling with your friends
- **Audio controls**: Mute/unmute your microphone
- **Video controls**: Turn your camera on/off
- **Real-time communication**: Text chat alongside video calls

### 🎯 Easy Connection

- **WatchID system**: Simple ID-based connection system
- **One-click invite**: Share your WatchID and invite friends instantly
- **Copy to clipboard**: Easy WatchID copying with visual feedback

### 🎨 Modern UI

- **Dark theme**: Sleek dark interface that doesn't interfere with video content
- **Responsive design**: Adapts to different screen sizes
- **Non-intrusive**: Sidebar design that doesn't block video content
- **Smooth animations**: Polished user experience

## 🚀 Getting Started

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/watchybara.git
   cd watchybara
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Build the extension**

   ```bash
   npm run build
   # or
   pnpm build
   ```

4. **Load in your browser**
   - Open Chrome/Edge and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `build/chrome-mv3-prod` folder

### Usage

1. **Start Watchybara**

   - Navigate to any video streaming site (Netflix, Prime Video, etc.)
   - Click the Watchybara extension icon in your browser toolbar
   - Click "Start Watchybara" to open the sidebar

2. **Connect with friends**

   - Share your WatchID with your friend
   - Enter your name and your friend's WatchID
   - Click "Invite" to start a video call

3. **Enjoy synchronized watching**
   - Your videos will automatically stay in sync
   - Use the chat feature to communicate
   - Control your audio/video as needed

## 🛠️ Development

### Prerequisites

- Node.js (v16 or higher)
- npm or pnpm

### Development Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start development server**

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

3. **Load development build**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select `build/chrome-mv3-dev`

### Project Structure

```
watchybara/
├── assets/
│   └── icon.png          # Extension icon
├── content.tsx           # Main content script with video sync logic
├── popup.tsx            # Extension popup interface
├── style.css            # Global styles
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

### Key Technologies

- **Plasmo Framework**: Modern browser extension development
- **React**: UI components and state management
- **WebRTC (simple-peer)**: Peer-to-peer video calling
- **Socket.io**: Signaling server for WebRTC connections
- **Tailwind CSS**: Styling and responsive design
- **TypeScript**: Type safety and better development experience

## 🔧 Configuration

### Environment Variables

The extension connects to a signaling server for WebRTC connections. The server URL is configured in `content.tsx`:

```typescript
const SERVER_URL = "https://google-meet-clone-server.onrender.com/"
```

### Permissions

The extension requires the following permissions:

- `scripting`: To inject content scripts
- `https://*/*`: To access video streaming sites

## 🎯 Supported Platforms

- **Netflix**: Full support for synchronized playback
- **Prime Video**: Full support for synchronized playback
- **Other platforms**: Basic video detection and control

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Test thoroughly**: Ensure the extension works on supported platforms
5. **Submit a pull request**

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Test on multiple streaming platforms
- Ensure video synchronization works correctly
- Maintain responsive design

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Plasmo Framework](https://docs.plasmo.com/)
- Video synchronization inspired by the need for social viewing experiences
- WebRTC implementation using [simple-peer](https://github.com/feross/simple-peer)

## 📞 Support

If you encounter any issues or have questions:

- Open an issue on GitHub
- Check the [Plasmo documentation](https://docs.plasmo.com/)
- Review the troubleshooting section below

## 🔍 Troubleshooting

### Common Issues

1. **Video not syncing**

   - Ensure both users are on the same video page
   - Try the "Sync Now" button
   - Check that the video element is detected

2. **Video call not connecting**

   - Verify the WatchID is correct
   - Check your internet connection
   - Ensure both users have granted camera/microphone permissions

3. **Extension not loading**
   - Check that you're using the correct build folder
   - Ensure developer mode is enabled
   - Try reloading the extension

### Debug Mode

Enable debug logging by opening the browser console and looking for Watchybara-related messages.

---

**Made with ❤️ for social video watching**
