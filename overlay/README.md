# Payment Alert Overlay

A lightweight, real-time donation overlay built with React and Vite for OBS Browser Source integration. Features animated donation popups, recent donations list, donation goal progress, and customizable theme presets.

## Features

- **Real-time Donation Alerts**: Socket.IO-powered instant notifications
- **Animated Popups**: Smooth entrance/exit animations based on donation tier
- **Audio Notifications**: Tier-based sound alerts with optional TTS
- **Recent Donations List**: Shows the last 5 donations with scrolling support
- **Donation Goal Progress**: Visual progress bar with real-time updates
- **Theme Presets**: 4 built-in themes (Basic, Silver, Gold, Ultra)
- **OBS Browser Source Compatible**: Transparent background, optimized rendering
- **Tier-based Styling**: Visual hierarchy based on donation amounts

## Donation Tiers

- **Basic**: ₹1 - ₹499 (Green theme)
- **Silver**: ₹500 - ₹999 (Silver gradient)
- **Gold**: ₹1000 - ₹4999 (Gold gradient with glow)
- **Ultra**: ₹5000+ (Rainbow gradient with premium effects)

## Installation

1. Install dependencies:
```bash
cd overlay
npm install
```

2. Copy the environment file:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:
```env
VITE_SOCKET_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000/api
VITE_THEME=basic
VITE_DONATION_GOAL=10000
VITE_RECENT_DONATIONS_LIMIT=5
VITE_ENABLE_AUDIO=true
VITE_ENABLE_TTS=false
VITE_ANIMATION_DURATION=5000
```

## Development

Start the development server:
```bash
npm run dev
```

The overlay will be available at `http://localhost:5173`

## Production Build

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## OBS Browser Source Setup

### Method 1: Development Server (Recommended for Testing)

1. Start the overlay development server:
   ```bash
   cd overlay
   npm run dev
   ```

2. In OBS Studio:
   - Add a new **Browser Source**
   - URL: `http://localhost:5173`
   - Width: `1920`
   - Height: `1080`
   - Check: ✅ **Shutdown source when not visible**
   - Check: ✅ **Refresh browser when scene becomes active**
   - Custom CSS (optional):
     ```css
     body { background-color: transparent; margin: 0px auto; overflow: hidden; }
     ```

3. Click **OK** to save

### Method 2: Production Build (Recommended for Live Streaming)

1. Build the overlay:
   ```bash
   cd overlay
   npm run build
   ```

2. Serve the `dist` folder using a web server:
   ```bash
   # Using Python
   cd dist
   python -m http.server 8080

   # Or using npx serve
   npx serve dist -p 8080
   ```

3. In OBS Studio:
   - Add a new **Browser Source**
   - URL: `http://localhost:8080`
   - Width: `1920`
   - Height: `1080`
   - Configure as above

### Method 3: Local File (Alternative)

1. Build the overlay
2. In OBS:
   - Add **Browser Source**
   - Check **Local file**
   - Browse to: `/path/to/overlay/dist/index.html`
   - Width: `1920`, Height: `1080`

**Note**: File protocol may have limitations with Socket.IO connections. HTTP server method is preferred.

## OBS Optimization Tips

### Performance Settings

- **FPS**: Custom: 30
- **CSS**: Add custom CSS for better performance:
  ```css
  body { 
    background-color: transparent; 
    margin: 0px auto; 
    overflow: hidden;
    image-rendering: -webkit-optimize-contrast;
  }
  ```

### Interaction Settings

- Uncheck "Interact" if you don't need to click elements
- Enable "Shutdown source when not visible" to save resources
- Enable "Refresh browser when scene becomes active"

### Positioning

The overlay is designed with:
- **Donation Popups**: Right side, vertically centered
- **Recent Donations & Goal**: Bottom left corner
- **Connection Status**: Top right corner

You can adjust positioning by:
1. Transforming the browser source in OBS
2. Modifying CSS in `src/App.css`
3. Using OBS filters (e.g., Chroma Key for advanced compositing)

## Theme Configuration

Change themes by setting the `VITE_THEME` environment variable:

```env
VITE_THEME=basic   # Green, simple design
VITE_THEME=silver  # Silver gradient, elegant
VITE_THEME=gold    # Gold gradient with glow
VITE_THEME=ultra   # Rainbow gradient, premium effects
```

Themes affect:
- Color schemes
- Fonts
- Animation styles
- Shadow effects
- Progress bar styling

## Customization

### Custom Themes

Edit `src/themes/themes.js` to create your own theme:

```javascript
export const themes = {
  myTheme: {
    name: 'My Custom Theme',
    colors: {
      primary: '#FF5733',
      secondary: '#C70039',
      background: 'rgba(255, 87, 51, 0.95)',
      text: '#ffffff',
      border: '#FFC300',
      progressBg: 'rgba(255, 87, 51, 0.3)',
      progressFill: 'linear-gradient(90deg, #FF5733 0%, #FFC300 100%)',
    },
    fonts: {
      primary: '"Comic Sans MS", cursive',
      size: {
        small: '14px',
        medium: '18px',
        large: '26px',
        xlarge: '36px',
      },
    },
    animation: {
      entrance: 'bounceIn',
      exit: 'fadeOut',
      duration: '0.6s',
    },
    shadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
  },
};
```

### Custom Audio

Replace the audio system in `src/utils/audio.js` with your own sound files:

```javascript
export const playDonationSound = async (tier) => {
  const audio = new Audio(`/sounds/${tier}.mp3`);
  audio.volume = 0.5;
  await audio.play();
};
```

### Animation Duration

Adjust how long donation popups stay visible:

```env
VITE_ANIMATION_DURATION=5000  # 5 seconds
```

## Troubleshooting

### Overlay Not Connecting

1. **Check Socket.IO server**: Ensure backend is running on port 3000
   ```bash
   # In project root
   npm start
   ```

2. **Verify CORS**: Backend allows `http://localhost:5173` in CORS settings

3. **Check browser console**: Open OBS Browser Source properties → Click "Interact" → Press F12 for console

4. **Connection status**: Look for the green indicator in the top-right corner

### No Donations Showing

1. **Check backend logs**: Ensure webhooks are being received
2. **Test with curl**:
   ```bash
   curl -X POST http://localhost:3000/api/webhooks/razorpay \
     -H "Content-Type: application/json" \
     -H "x-razorpay-signature: test" \
     -d '{"event":"payment.captured","payload":{"payment":{"id":"pay_test","order_id":"order_test","amount":50000,"method":"upi"}}}'
   ```

3. **Verify database**: Check that orders are marked as "paid"

### Audio Not Playing

1. **Enable audio in config**:
   ```env
   VITE_ENABLE_AUDIO=true
   ```

2. **OBS audio settings**: 
   - Right-click Browser Source → Properties
   - Check "Monitor Output" in Audio Mixer

3. **Browser autoplay policy**: Some browsers block autoplay. Interact with the page first.

### TTS Not Working

1. **Enable TTS**:
   ```env
   VITE_ENABLE_TTS=true
   ```

2. **Check browser support**: TTS uses Web Speech API (Chrome/Edge recommended)

3. **Privacy settings**: Ensure microphone/speech permissions are granted

## API Endpoints Used

The overlay connects to these backend endpoints:

- **Socket.IO**: `ws://localhost:3000/socket.io/`
  - Events: `new_donation`, `recent_donations`, `stats_update`, `goal_progress`

- **REST API**:
  - `GET /api/donation-goal` - Fetch goal progress
  - `GET /api/recent-donations?limit=5` - Fetch recent donations
  - `GET /api/stats` - Fetch statistics

## Performance Considerations

- **Efficient Re-renders**: Uses React hooks optimally
- **Animation Queue**: Donations queue to avoid overlapping popups
- **Memory Management**: Limited to 10 donations in state
- **Transparent Background**: No unnecessary rendering overhead
- **CSS Hardware Acceleration**: GPU-accelerated animations

## Browser Compatibility

- ✅ **Chrome/Chromium**: Full support (recommended for OBS)
- ✅ **Edge**: Full support
- ⚠️ **Firefox**: Limited TTS support
- ❌ **Safari**: Limited Web Speech API support

## Development Tips

### Hot Module Replacement

Vite supports HMR - changes reflect instantly without full reload.

### React DevTools

Install React DevTools browser extension for debugging.

### Socket.IO Debugging

Enable Socket.IO debugging in console:
```javascript
localStorage.debug = 'socket.io-client:*';
```

### Production Testing

Test production build locally:
```bash
npm run build
npm run preview
```

## License

ISC

## Support

For issues or questions:
1. Check troubleshooting section
2. Review backend logs
3. Open an issue on GitHub

## Credits

Built with:
- React 18
- Vite 6
- Socket.IO Client 4
- CSS3 Animations
- Web Audio API
- Web Speech API
