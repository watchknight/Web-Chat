# ModernChat - Interactive Chat Web Application

A fully interactive, modern chat web application with authentication built using HTML, CSS, and JavaScript.

## Features

### 🔐 Authentication System
- Beautiful login/signup page with smooth transitions
- Email format validation
- Password strength indicator with visual feedback
- "Remember me" checkbox functionality
- Password visibility toggle
- Animated form switching between login and signup
- Welcome screen after successful login
- Session management using localStorage
- Auto-logout after 30 minutes of inactivity
- User profile creation (username, avatar, bio)

### 🎨 Interactive UI/UX Elements
- Splash screen with loading animation on app launch
- Smooth page transitions and route changes
- Animated gradient backgrounds with floating orbs
- Interactive hover effects on all clickable elements
- Ripple effects on buttons
- Toast notifications for various actions
- Modal dialogs for settings and confirmations
- Emoji picker with categories and search
- Glassmorphism effects on cards and panels
- Smooth scrollbar with custom styling

### 💬 Chat Features
- Real-time messaging interface with smooth animations
- Message bubbles with slide-in animations
- Typing indicators with animated dots
- Online/offline user status with pulse animations
- User list/contacts sidebar with search
- Message reactions support
- Message timestamps with formatting
- Unread message badges with bounce animation
- Sound effects (toggle on/off in settings)
- Desktop notifications

### ⚙️ Dashboard & Settings
- Comprehensive settings panel
- Theme customization (Light/Dark/Auto)
- Custom accent color picker
- Font size adjustment slider
- Notification preferences panel
- Profile editor with avatar upload
- Privacy settings (Last seen, Read receipts)
- Social login buttons (UI only)

### ⌨️ Advanced Interactions
- Keyboard shortcuts:
  - `Ctrl/Cmd + K`: Search conversations
  - `Ctrl/Cmd + N`: New message
  - `Ctrl/Cmd + ,`: Open settings
  - `?`: Show keyboard shortcuts
  - `Esc`: Close modals
- Auto-expand textarea as you type
- Interactive emoji picker
- Responsive design (mobile-friendly)

## Getting Started

### Installation

1. Clone or download this repository
2. Open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari)
3. No build process or dependencies required!

### Usage

#### First Time Setup
1. Launch the application by opening `index.html`
2. You'll see the splash screen animation
3. Click "Sign Up" to create a new account or "Sign In" if you already have one
4. Fill in your details:
   - For Sign Up: Username, Email, Password
   - For Sign In: Email, Password
5. Check "Remember me" if you want to stay logged in
6. Click the submit button to authenticate

#### Using the Chat Interface
1. **Browse Conversations**: Click on any chat in the sidebar to open it
2. **Send Messages**: Type your message in the input field and press Enter or click the send button
3. **Use Emojis**: Click the emoji button to open the emoji picker
4. **Upload Files**: Click the attachment button to upload images (for demo purposes)
5. **Search**: Use the search bar to find conversations
6. **Switch Tabs**: Click between Chats, Contacts, and Groups tabs

#### Managing Your Profile
1. Click on your profile picture in the sidebar header
2. Update your username and bio
3. Click "Change Avatar" to upload a new profile picture
4. Click "Save Changes" to update your profile

#### Customize Your Experience
1. Open Settings by clicking the gear icon
2. **Profile Tab**: Manage your profile information
3. **Theme Tab**: 
   - Change theme mode (Light/Dark/Auto)
   - Pick a custom accent color
   - Adjust font size
4. **Notifications Tab**: Toggle desktop notifications and sound effects
5. **Privacy Tab**: Manage privacy settings

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Edge
- Safari
- Opera

## Features in Detail

### Real User Contacts
The application now supports real user management:
- Add contacts manually with name and email
- Share your contact link with others
- No demo/bot accounts - only real users you add
- All contacts and chats are stored locally
- Data persists between sessions

### Adding Contacts
1. Navigate to the Contacts tab
2. Click "Add New Contact"
3. Enter contact name and email
4. Or share your contact link with others
5. When someone clicks your link, they'll be added to their contacts

### Sharing the Application
Simply share the `index.html` file with others. Each user will:
1. Create their own account
2. Add other users as contacts
3. Have their own independent chat data stored locally
4. Be able to customize their profile and settings

### Responsive Design
- Desktop: Full sidebar and chat interface
- Mobile: Collapsible sidebar, optimized touch areas (minimum 44px)
- Tablet: Adaptive layout

## Technical Details

### Technology Stack
- **HTML5**: Semantic structure
- **CSS3**: Modern styling with animations and transitions
- **JavaScript (Vanilla)**: No frameworks required
- **Font Awesome**: Icon library
- **Google Fonts**: Typography

### Key Features Implementation
- SPA (Single Page Application) structure
- Client-side routing without page reloads
- CSS animations with GPU acceleration
- localStorage for persistence
- Responsive design with media queries
- Accessibility features (ARIA labels, keyboard navigation)

### Performance Optimizations
- CSS transforms for smooth animations
- Debounced search functionality
- Lazy loading capabilities
- Efficient DOM manipulation

## Customization

### Changing Accent Colors
1. Go to Settings → Theme
2. Pick a new color from the color picker
3. Click "Apply Theme"

### Adding Custom Emojis
Edit the `emojis` object in `script.js`:
```javascript
emojis: {
    smileys: ['😀', '😃', ...],
    custom: ['🎉', '🎊']
}
```

### Modifying Auto-logout Duration
In `script.js`, change the `INACTIVITY_DURATION` constant:
```javascript
const INACTIVITY_DURATION = 30 * 60 * 1000; // Change to desired milliseconds
```

## Troubleshooting

### Issue: Notifications not working
**Solution**: Make sure you've granted notification permissions to your browser.

### Issue: Theme not applying
**Solution**: Clear your browser's localStorage and try again.

### Issue: Sounds not playing
**Solution**: Check your system sound settings and ensure JavaScript is enabled.

## Future Enhancements

- Backend integration for real-time messaging
- Group chat functionality
- Message reactions
- File upload and sharing
- Voice and video calling
- Message search
- Chat history export
- Offline support with Service Worker
- PWA installation

## License

This project is open source and available for educational purposes.

## Credits

- Icons: [Font Awesome](https://fontawesome.com/)
- Fonts: [Google Fonts](https://fonts.google.com/)
- Avatars: [UI Avatars](https://ui-avatars.com/)

---

**Note**: This is a frontend-only application for demonstration purposes. In a production environment, it would require a backend server for authentication, real-time messaging, and data persistence.

