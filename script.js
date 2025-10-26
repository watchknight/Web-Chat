// ============================================
// GLOBAL STATE & DATA
// ============================================

const state = {
    currentUser: null,
    activeChat: null,
    chats: [],
    contacts: [],
    groups: [],
    settings: {
        theme: 'light',
        accentColor: '#007bff',
        fontSize: 16,
        desktopNotifications: true,
        soundEffects: true,
        emailNotifications: false,
        lastSeen: true,
        readReceipts: true
    },
    emojis: {
        smileys: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
        people: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜'],
        animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆'],
        food: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🍍', '🥭', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🌽'],
        activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🏹', '🎣', '🏊'],
        travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍', '🛵', '🚲', '🛴', '🛹', '🛼'],
        objects: ['💡', '🔥', '💰', '💎', '⚡', '☄️', '⭐', '🌟', '✨', '💫', '🪐', '🌈', '☀️', '🌙', '💍', '🎁', '🎊', '🎉', '🏆', '🥇']
    },
    typingUsers: new Set(),
    inactivityTimer: null,
    shortcutsActive: false
};

// ============================================
// INITIALIZATION
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadSavedSettings();
    checkAuthState();
    
    // Auto-save user data before page unload
    window.addEventListener('beforeunload', () => {
        saveAllUserData();
    });
    
    // Auto-save periodically (every 30 seconds)
    setInterval(() => {
        if (state.currentUser) {
            saveAllUserData();
        }
    }, 30000);
});

function initializeApp() {
    // Hide splash screen after animation (only for new users)
    const isLoggedIn = localStorage.getItem('currentUser');
    if (!isLoggedIn) {
        setTimeout(() => {
            document.getElementById('splash-screen').classList.add('hidden');
        }, 2500);
    } else {
        document.getElementById('splash-screen').classList.add('hidden');
    }

    // Setup emoji picker
    setupEmojiPicker();
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Setup inactivity detector
    setupInactivityDetector();
    
    // Add ripple effect to buttons
    addRippleEffects();
}

function setupEventListeners() {
    // Auth form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    
    // Chat search
    const chatSearch = document.getElementById('chatSearch');
    if (chatSearch) {
        chatSearch.addEventListener('input', handleChatSearch);
    }
    
    // File input change
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,video/*,.pdf,.doc,.docx';
    fileInput.addEventListener('change', handleFileUpload);
    
    // Theme mode change
    const themeMode = document.getElementById('themeMode');
    if (themeMode) {
        themeMode.addEventListener('change', (e) => {
            applyTheme();
        });
    }
    
    // Font size change
    const fontSize = document.getElementById('fontSize');
    if (fontSize) {
        fontSize.addEventListener('input', (e) => {
            const fontSizeValue = document.getElementById('fontSizeValue');
            if (fontSizeValue) {
                fontSizeValue.textContent = e.target.value + 'px';
            }
            document.documentElement.style.fontSize = e.target.value + 'px';
        });
    }
    
    // Accent color change
    const accentColor = document.getElementById('accentColor');
    if (accentColor) {
        accentColor.addEventListener('input', (e) => {
            const accentColorValue = document.getElementById('accentColorValue');
            if (accentColorValue) {
                accentColorValue.textContent = e.target.value;
            }
            document.documentElement.style.setProperty('--primary-color', e.target.value);
        });
    }
    
    // Mobile keyboard handling
    if (window.innerWidth <= 768) {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('focus', () => {
                setTimeout(() => {
                    const messagesArea = document.getElementById('messagesArea');
                    if (messagesArea) {
                        messagesArea.scrollTop = messagesArea.scrollHeight;
                    }
                }, 300);
            });
        }
    }
}

// ============================================
// AUTHENTICATION
// ============================================

function checkAuthState() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        state.currentUser = JSON.parse(savedUser);
        // Hide splash screen immediately for returning users
        document.getElementById('splash-screen').classList.add('hidden');
        // Skip welcome screen for returning users
        showChatApp();
        loadChats();
    } else {
        document.getElementById('auth-container').classList.remove('hidden');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validate email format
    if (!validateEmail(email)) {
        showToast('Invalid email format', 'error');
        return;
    }
    
    // Simulate login (in real app, this would be an API call)
    const mockUser = {
        id: Date.now(),
        email: email,
        username: email.split('@')[0],
        avatar: generateAvatarUrl(email)
    };
    
    state.currentUser = mockUser;
    
    // Always save to localStorage for persistent login
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    localStorage.setItem('lastActive', Date.now().toString());
    
    // Clear form
    document.getElementById('loginForm').reset();
    
    // Show welcome screen
    showWelcomeScreen();
    
    setTimeout(() => {
        hideWelcomeScreen();
        showChatApp();
        loadChats();
        showToast(`Welcome back, ${mockUser.username}!`, 'success');
    }, 3000);
}

function handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Validate email format
    if (!validateEmail(email)) {
        showToast('Invalid email format', 'error');
        return;
    }
    
    // Check password match
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    // Check password strength
    const strength = checkPasswordStrength(password);
    if (strength === 'weak') {
        showToast('Password is too weak. Please use a stronger password.', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showToast('Please agree to the terms and conditions', 'error');
        return;
    }
    
    // Simulate signup
    const mockUser = {
        id: Date.now(),
        email: email,
        username: username,
        avatar: generateAvatarUrl(email)
    };
    
    state.currentUser = mockUser;
    
    // Always save to localStorage for persistent login
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    localStorage.setItem('lastActive', Date.now().toString());
    
    // Create user profile in storage
    localStorage.setItem(`user_${mockUser.id}`, JSON.stringify({
        username: username,
        bio: '',
        avatar: mockUser.avatar
    }));
    
    document.getElementById('signupForm').reset();
    document.getElementById('signupPasswordStrength').innerHTML = '';
    
    // Show welcome screen
    showWelcomeScreen();
    
    setTimeout(() => {
        hideWelcomeScreen();
        showChatApp();
        loadChats();
        showToast(`Welcome to ModernChat, ${username}!`, 'success');
    }, 3000);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function generateAvatarUrl(email) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=007bff&color=fff&size=128`;
}

function switchAuth(form) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (form === 'signup') {
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
    } else {
        signupForm.classList.remove('active');
        loginForm.classList.add('active');
    }
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function checkPasswordStrength(password) {
    const strengthDiv = document.getElementById('signupPasswordStrength');
    let strength = 'weak';
    let strengthClass = 'password-strength-weak';
    
    if (password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)) {
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            strength = 'strong';
            strengthClass = 'password-strength-strong';
        } else {
            strength = 'medium';
            strengthClass = 'password-strength-medium';
        }
    }
    
    strengthDiv.innerHTML = `<div class="password-strength-fill ${strengthClass}"></div>`;
    
    return strength;
}

// ============================================
// UI TRANSITIONS
// ============================================

function showWelcomeScreen() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('welcome-screen').classList.remove('hidden');
    
    if (state.currentUser) {
        document.getElementById('welcomeName').textContent = state.currentUser.username;
    }
}

function hideWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
        welcomeScreen.classList.add('hidden');
    }
}

function showChatApp() {
    document.getElementById('chat-app').classList.remove('hidden');
    
    // Populate user info
    if (state.currentUser) {
        const savedProfile = localStorage.getItem(`user_${state.currentUser.id}`);
        if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            // Use profile data if available
            document.getElementById('userName').textContent = profile.username || state.currentUser.username;
            document.getElementById('userAvatar').src = profile.avatar || state.currentUser.avatar;
        } else {
            // Use basic user data
            document.getElementById('userAvatar').src = state.currentUser.avatar;
            document.getElementById('userName').textContent = state.currentUser.username;
        }
    }
    
    // Initialize demo data
    initializeDemoData();
}

// ============================================
// DEMO DATA
// ============================================

function initializeDemoData() {
    // Load contacts from localStorage
    loadContactsFromStorage();
    renderChats();
    renderContacts();
}

function loadContactsFromStorage() {
    try {
        const savedContacts = localStorage.getItem('contacts');
        const savedChats = localStorage.getItem('chats');
        
        if (savedContacts) {
            state.contacts = JSON.parse(savedContacts);
        } else {
            state.contacts = [];
        }
        
        if (savedChats) {
            state.chats = JSON.parse(savedChats);
        } else {
            state.chats = [];
        }
    } catch (e) {
        console.error('Failed to load data:', e);
        state.contacts = [];
        state.chats = [];
        showToast('Failed to load saved data', 'error');
    }
}

function saveContactsToStorage() {
    try {
        localStorage.setItem('contacts', JSON.stringify(state.contacts));
    } catch (e) {
        console.error('Failed to save contacts:', e);
        showToast('Failed to save contacts to storage', 'error');
    }
}

function saveChatsToStorage() {
    try {
        localStorage.setItem('chats', JSON.stringify(state.chats));
    } catch (e) {
        console.error('Failed to save chats:', e);
        showToast('Failed to save chats to storage', 'error');
    }
}

function loadChats() {
    // Reload chats from localStorage to ensure we have the latest data
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
        try {
            state.chats = JSON.parse(savedChats);
        } catch (e) {
            console.error('Failed to load chats:', e);
            state.chats = [];
        }
    }
    renderChats();
}

function renderChats() {
    const chatsList = document.getElementById('chatsList');
    chatsList.innerHTML = '';
    
    if (state.chats.length === 0) {
        chatsList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <i class="fas fa-comments" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem; display: block;"></i>
                <p>No conversations yet</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Start a new chat with a contact</p>
            </div>
        `;
        return;
    }
    
    state.chats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.onclick = () => openChat(chat);
        
        const statusClass = chat.status === 'online' ? 'online' : 'offline';
        
        chatItem.innerHTML = `
            <div class="chat-avatar">
                <img src="${chat.avatar}" alt="${chat.name}">
                <span class="status-indicator ${statusClass}"></span>
            </div>
            <div class="chat-info">
                <h4>${chat.name}</h4>
                <p>${chat.lastMessage || 'No messages yet'}</p>
            </div>
            <div class="chat-meta">
                ${chat.unread > 0 ? `<span class="unread-badge">${chat.unread}</span>` : ''}
                <span class="chat-time">${chat.timestamp}</span>
                <button class="btn-icon" onclick="deleteChat(${chat.id}); event.stopPropagation();" title="Delete chat" style="color: var(--danger-color); margin-left: 0.5rem;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        chatsList.appendChild(chatItem);
    });
}

function renderContacts() {
    const contactsList = document.getElementById('contactsList');
    contactsList.innerHTML = '';
    
    // Add "New Contact" button
    const addContactBtn = document.createElement('div');
    addContactBtn.className = 'chat-item';
    addContactBtn.style.background = 'var(--primary-color)';
    addContactBtn.style.color = 'white';
    addContactBtn.style.cursor = 'pointer';
    addContactBtn.style.marginBottom = '0.5rem';
    addContactBtn.onclick = openAddContactModal;
    addContactBtn.innerHTML = `
        <div class="chat-avatar">
            <i class="fas fa-plus-circle" style="font-size: 2rem;"></i>
        </div>
        <div class="chat-info">
            <h4>Add New Contact</h4>
            <p>Click to add a friend</p>
        </div>
    `;
    contactsList.appendChild(addContactBtn);
    
    if (state.contacts.length === 0) {
        contactsList.innerHTML += `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary); margin-top: 1rem;">
                <i class="fas fa-users" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem; display: block;"></i>
                <p>No contacts yet</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Add friends to start chatting</p>
            </div>
        `;
    }
    
    state.contacts.forEach(contact => {
        const contactItem = document.createElement('div');
        contactItem.className = 'chat-item';
        contactItem.onclick = () => startChatWithContact(contact);
        
        const statusClass = contact.status === 'online' ? 'online' : 'offline';
        
        contactItem.innerHTML = `
            <div class="chat-avatar">
                <img src="${contact.avatar}" alt="${contact.name}">
                <span class="status-indicator ${statusClass}"></span>
            </div>
            <div class="chat-info">
                <h4>${contact.name}</h4>
                <p>${contact.email}</p>
            </div>
        `;
        
        contactsList.appendChild(contactItem);
    });
}

function startChatWithContact(contact) {
    // Check if chat already exists
    let existingChat = state.chats.find(chat => chat.id === contact.id);
    
    if (!existingChat) {
        existingChat = {
            id: contact.id,
            name: contact.name,
            avatar: contact.avatar,
            status: contact.status,
            lastMessage: 'No messages yet',
            timestamp: 'now',
            unread: 0,
            messages: []
        };
        state.chats.unshift(existingChat);
        saveChatsToStorage();
        renderChats();
    }
    
    openChat(existingChat);
}

function openChat(chat) {
    state.activeChat = chat;
    
    // Update active chat UI
    document.getElementById('activeChatName').textContent = chat.name;
    document.getElementById('activeChatAvatar').src = chat.avatar;
    document.getElementById('activeChatStatus').className = `status-indicator ${chat.status === 'online' ? 'online' : 'offline'}`;
    document.getElementById('activeChatStatusText').textContent = chat.status === 'online' ? 'Online' : 'Offline';
    
    // Mark chat as active
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and mark active chat
    const chatItems = document.querySelectorAll('#chatsList .chat-item');
    chatItems.forEach(item => {
        if (item.querySelector('h4').textContent === chat.name) {
            item.classList.add('active');
        }
    });
    
    // Load messages
    loadMessages(chat);
}

function loadMessages(chat) {
    const messagesArea = document.getElementById('messagesArea');
    messagesArea.innerHTML = '';
    
    // Load messages from chat object or storage
    let messages = chat.messages || [];
    
    if (messages.length === 0) {
        messagesArea.innerHTML = `
            <div class="empty-chat">
                <i class="fas fa-comments"></i>
                <h2>Start a conversation</h2>
                <p>Type a message below to start chatting with ${chat.name}</p>
            </div>
        `;
        return;
    }
    
    messages.forEach(message => {
        addMessageToChat(message.text, message.timestamp, message.sent);
    });
    
    // Scroll to bottom
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function addMessageToChat(text, timestamp, sent = false) {
    const messagesArea = document.getElementById('messagesArea');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-bubble ${sent ? 'sent' : 'received'}`;
    
    const avatar = state.activeChat ? `<img src="${escapeHtml(state.activeChat.avatar)}" alt="Avatar">` : '';
    const safeText = escapeHtml(text);
    
    messageDiv.innerHTML = `
        ${!sent ? avatar : ''}
        <div class="message-content">
            <p>${safeText}</p>
            <span class="message-time">${escapeHtml(timestamp)}</span>
        </div>
    `;
    
    messagesArea.appendChild(messageDiv);
    
    // Remove empty state if exists
    const emptyChat = messagesArea.querySelector('.empty-chat');
    if (emptyChat) {
        emptyChat.remove();
    }
    
    // Scroll to bottom
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

// ============================================
// MESSAGING
// ============================================

function sendMessage() {
    const input = document.getElementById('messageInput');
    if (!input) return;
    
    const message = input.value.trim();
    
    if (!message || !state.activeChat) {
        showToast('Please select a chat first', 'error');
        return;
    }
    
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const messageObj = { text: message, timestamp: timestamp, sent: true };
    
    // Initialize messages array if it doesn't exist
    if (!state.activeChat.messages) {
        state.activeChat.messages = [];
    }
    
    // Add message to chat
    state.activeChat.messages.push(messageObj);
    state.activeChat.lastMessage = message;
    state.activeChat.timestamp = timestamp;
    
    // Update in chats array
    const chatIndex = state.chats.findIndex(c => c.id === state.activeChat.id);
    if (chatIndex !== -1) {
        state.chats[chatIndex] = state.activeChat;
    }
    
    saveChatsToStorage();
    renderChats();
    
    addMessageToChat(message, timestamp, true);
    
    input.value = '';
    autoExpandTextarea(input);
    
    // Play sound if enabled
    if (state.settings.soundEffects) {
        playNotificationSound();
    }
    
    // Send notification if enabled
    if (state.settings.desktopNotifications) {
        sendDesktopNotification('Message sent', 'Your message has been delivered');
    }
}

function handleInputKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

function autoExpandTextarea(element) {
    element.style.height = 'auto';
    const maxHeight = window.innerWidth <= 768 ? 150 : 120;
    const newHeight = Math.min(element.scrollHeight, maxHeight);
    element.style.height = newHeight + 'px';
    element.style.overflowY = element.scrollHeight > maxHeight ? 'auto' : 'hidden';
}

function showTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    indicator.classList.remove('hidden');
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    indicator.classList.add('hidden');
}

// ============================================
// EMOJI PICKER
// ============================================

let emojiPickerOpen = false;

function setupEmojiPicker() {
    const emojiGrid = document.getElementById('emojiGrid');
    
    // Populate emojis
    let allEmojis = [];
    Object.values(state.emojis).forEach(category => {
        allEmojis = allEmojis.concat(category);
    });
    
    allEmojis.forEach(emoji => {
        const emojiItem = document.createElement('div');
        emojiItem.className = 'emoji-item';
        emojiItem.textContent = emoji;
        emojiItem.onclick = () => insertEmoji(emoji);
        emojiGrid.appendChild(emojiItem);
    });
    
    // Category switching
    document.querySelectorAll('.emoji-category').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.emoji-category').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });
}

function toggleEmojiPicker() {
    emojiPickerOpen = !emojiPickerOpen;
    const picker = document.getElementById('emojiPicker');
    
    if (emojiPickerOpen) {
        picker.classList.remove('hidden');
    } else {
        picker.classList.add('hidden');
    }
}

function insertEmoji(emoji) {
    const input = document.getElementById('messageInput');
    input.focus();
    input.value += emoji;
    autoExpandTextarea(input);
    toggleEmojiPicker();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function playNotificationSound() {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

function sendDesktopNotification(title, message) {
    if (!('Notification' in window)) {
        return;
    }
    
    if (Notification.permission === 'granted') {
        new Notification(title, { body: message, icon: '/favicon.ico' });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(title, { body: message, icon: '/favicon.ico' });
            }
        });
    }
}

function addRippleEffects() {
    document.querySelectorAll('.btn-primary, .btn-secondary, .btn-icon').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                width: 0;
                height: 0;
                left: ${x}px;
                top: ${y}px;
                transform: translate(-50%, -50%);
                animation: ripple 0.6s ease-out;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// ============================================
// TABS & NAVIGATION
// ============================================

function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.closest('.tab').classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tab}-tab`).classList.add('active');
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
    
    // On mobile, add overlay
    if (window.innerWidth <= 768) {
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
        `;
        overlay.onclick = () => {
            sidebar.classList.remove('open');
            overlay.remove();
        };
        
        if (sidebar.classList.contains('open') && !document.querySelector('.sidebar-overlay')) {
            document.body.appendChild(overlay);
        } else {
            const existingOverlay = document.querySelector('.sidebar-overlay');
            if (existingOverlay) existingOverlay.remove();
        }
    }
}

// Handle swipe gestures on mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchmove', (e) => {
    if (window.innerWidth <= 768) {
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // Swipe right to open sidebar (from left edge)
        if (touchStartX < 20 && deltaX > 50 && Math.abs(deltaY) < Math.abs(deltaX)) {
            document.querySelector('.sidebar').classList.add('open');
            toggleSidebar();
        }
        
        // Swipe left to close sidebar
        if (touchEndX < touchStartX && deltaX < -50 && Math.abs(deltaY) < Math.abs(deltaX)) {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                const overlay = document.querySelector('.sidebar-overlay');
                if (overlay) overlay.remove();
            }
        }
    }
});

// Prevent iOS bounce scrolling
document.addEventListener('touchmove', (e) => {
    if (e.target === document.body || e.target === document.documentElement) {
        e.preventDefault();
    }
}, { passive: false });

// ============================================
// SETTINGS
// ============================================

function openSettings() {
    document.getElementById('settingsModal').classList.remove('hidden');
    
    // Load current user profile
    if (state.currentUser) {
        const profile = JSON.parse(localStorage.getItem(`user_${state.currentUser.id}`) || '{}');
        document.getElementById('profileUsername').value = state.currentUser.username;
        document.getElementById('profileBio').value = profile.bio || '';
        document.getElementById('profileAvatar').src = state.currentUser.avatar;
    }
    
    // Load settings
    loadSettings();
}

function closeSettings() {
    document.getElementById('settingsModal').classList.add('hidden');
}

function openSettingsTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
    event.target.closest('.settings-tab').classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.settings-section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(`${tab}-tab`).classList.remove('hidden');
}

function saveProfile() {
    const username = document.getElementById('profileUsername').value;
    const bio = document.getElementById('profileBio').value;
    
    if (state.currentUser) {
        const profile = {
            username: username,
            bio: bio,
            avatar: state.currentUser.avatar
        };
        localStorage.setItem(`user_${state.currentUser.id}`, JSON.stringify(profile));
        state.currentUser.username = username;
        document.getElementById('userName').textContent = username;
        showToast('Profile saved successfully!', 'success');
    }
}

function changeAvatar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const newAvatar = event.target.result;
                state.currentUser.avatar = newAvatar;
                document.getElementById('userAvatar').src = newAvatar;
                document.getElementById('profileAvatar').src = newAvatar;
                showToast('Avatar updated!', 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function loadSettings() {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
        state.settings = { ...state.settings, ...JSON.parse(savedSettings) };
    }
    
    // Apply settings to UI
    document.getElementById('themeMode').value = state.settings.theme;
    document.getElementById('accentColor').value = state.settings.accentColor;
    document.getElementById('accentColorValue').textContent = state.settings.accentColor;
    document.getElementById('fontSize').value = state.settings.fontSize;
    document.getElementById('fontSizeValue').textContent = state.settings.fontSize + 'px';
    document.getElementById('desktopNotifications').checked = state.settings.desktopNotifications;
    document.getElementById('soundEffects').checked = state.settings.soundEffects;
    document.getElementById('emailNotifications').checked = state.settings.emailNotifications;
    document.getElementById('lastSeen').checked = state.settings.lastSeen;
    document.getElementById('readReceipts').checked = state.settings.readReceipts;
}

function saveSettings() {
    localStorage.setItem('appSettings', JSON.stringify(state.settings));
}

function applyTheme() {
    const theme = document.getElementById('themeMode').value;
    const accentColor = document.getElementById('accentColor').value;
    const fontSize = document.getElementById('fontSize').value;
    
    state.settings.theme = theme;
    state.settings.accentColor = accentColor;
    state.settings.fontSize = parseInt(fontSize);
    
    // Apply theme
    document.body.classList.toggle('dark-theme', theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches));
    document.documentElement.style.setProperty('--primary-color', accentColor);
    document.documentElement.style.fontSize = fontSize + 'px';
    
    saveSettings();
    showToast('Theme applied successfully!', 'success');
}

function loadSavedSettings() {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        state.settings = settings;
        
        // Apply theme
        if (settings.theme) {
            document.body.classList.toggle('dark-theme', settings.theme === 'dark' || (settings.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches));
        }
        
        if (settings.accentColor) {
            document.documentElement.style.setProperty('--primary-color', settings.accentColor);
        }
        
        if (settings.fontSize) {
            document.documentElement.style.fontSize = settings.fontSize + 'px';
        }
    }
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K: Search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('chatSearch')?.focus();
        }
        
        // Ctrl/Cmd + N: New message
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            showToast('New message feature coming soon!', 'info');
        }
        
        // Ctrl/Cmd + ,: Settings
        if ((e.ctrlKey || e.metaKey) && e.key === ',') {
            e.preventDefault();
            openSettings();
        }
        
        // ?: Toggle shortcuts
        if (e.key === '?' && !e.ctrlKey && !e.metaKey && !state.shortcutsActive) {
            toggleShortcuts();
        }
        
        // Escape: Close modals
        if (e.key === 'Escape') {
            closeSettings();
            document.getElementById('settingsModal').classList.add('hidden');
            document.getElementById('shortcutsModal').classList.add('hidden');
        }
    });
}

function toggleShortcuts() {
    state.shortcutsActive = !state.shortcutsActive;
    const modal = document.getElementById('shortcutsModal');
    modal.classList.toggle('hidden');
}

// ============================================
// INACTIVITY DETECTOR
// ============================================

function setupInactivityDetector() {
    let inactivityTimer;
    const INACTIVITY_DURATION = 30 * 60 * 1000; // 30 minutes
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
        document.addEventListener(event, () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                if (state.currentUser) {
                    logout();
                }
            }, INACTIVITY_DURATION);
        });
    });
}

function logout() {
    localStorage.removeItem('currentUser');
    state.currentUser = null;
    state.activeChat = null;
    
    document.getElementById('chat-app').classList.add('hidden');
    document.getElementById('auth-container').classList.remove('hidden');
    
    // Reset forms
    document.getElementById('loginForm').reset();
    document.getElementById('signupForm').reset();
    
    showToast('Logged out due to inactivity', 'info');
}

function manualLogout() {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('currentUser');
        state.currentUser = null;
        state.activeChat = null;
        
        // Close settings modal
        closeSettings();
        
        // Hide chat app and show auth
        document.getElementById('chat-app').classList.add('hidden');
        document.getElementById('auth-container').classList.remove('hidden');
        
        // Reset forms
        document.getElementById('loginForm').reset();
        document.getElementById('signupForm').reset();
        
        showToast('You have been logged out', 'success');
    }
}

// ============================================
// FILE UPLOAD
// ============================================

function openFileUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = handleFileUpload;
    input.click();
}

function handleFileUpload(e) {
    const files = e.target.files;
    if (files.length > 0) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                handleImageUpload(file);
            } else {
                showToast(`File "${file.name}" uploaded`, 'success');
            }
        });
    }
}

function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
        const imageUrl = event.target.result;
        addMessageToChat('', new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), true);
        
        // Add image to message
        const messagesArea = document.getElementById('messagesArea');
        const lastMessage = messagesArea.lastElementChild;
        const messageContent = lastMessage.querySelector('.message-content');
        const img = document.createElement('img');
        img.src = imageUrl;
        img.style.width = '200px';
        img.style.height = 'auto';
        img.style.borderRadius = '8px';
        img.style.marginTop = '8px';
        messageContent.appendChild(img);
        
        showToast('Image uploaded successfully', 'success');
    };
    reader.readAsDataURL(file);
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

function handleChatSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const chatItems = document.querySelectorAll('#chatsList .chat-item');
    
    chatItems.forEach(item => {
        const chatName = item.querySelector('h4')?.textContent.toLowerCase() || '';
        const chatMessage = item.querySelector('p')?.textContent.toLowerCase() || '';
        
        if (chatName.includes(searchTerm) || chatMessage.includes(searchTerm)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// ============================================
// ADDITIONAL UI FUNCTIONS
// ============================================

function searchInChat() {
    const searchTerm = prompt('Enter search term:');
    if (searchTerm && state.activeChat && state.activeChat.messages) {
        const results = state.activeChat.messages.filter(msg => 
            msg.text.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (results.length > 0) {
            showToast(`Found ${results.length} messages`, 'success');
        } else {
            showToast('No messages found', 'info');
        }
    }
}

function openChatInfo() {
    if (!state.activeChat) {
        showToast('No chat selected', 'error');
        return;
    }
    
    const info = `
Chat Info:
Name: ${state.activeChat.name}
Status: ${state.activeChat.status}
Messages: ${state.activeChat.messages ? state.activeChat.messages.length : 0}
Last Activity: ${state.activeChat.timestamp}
    `;
    
    alert(info.trim());
}

function openProfileModal() {
    openSettings();
    openSettingsTab('profile');
}

function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        localStorage.clear();
        window.location.reload();
    }
}

function deleteChat(chatId) {
    if (confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
        state.chats = state.chats.filter(chat => chat.id !== chatId);
        saveChatsToStorage();
        renderChats();
        
        // Close chat if it was active
        if (state.activeChat && state.activeChat.id === chatId) {
            state.activeChat = null;
            const messagesArea = document.getElementById('messagesArea');
            messagesArea.innerHTML = `
                <div class="empty-chat">
                    <i class="fas fa-comments"></i>
                    <h2>No conversation selected</h2>
                    <p>Choose a chat from the sidebar to start messaging</p>
                </div>
            `;
        }
        
        showToast('Chat deleted successfully', 'success');
    }
}

// ============================================
// DATA PERSISTENCE & BACKUP
// ============================================

// Save all user data to localStorage
function saveAllUserData() {
    try {
        // Save user profile
        if (state.currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
        }
        
        // Save contacts
        saveContactsToStorage();
        
        // Save chats
        saveChatsToStorage();
        
        // Save settings
        saveSettings();
        
        console.log('All user data saved successfully');
    } catch (e) {
        console.error('Failed to save user data:', e);
        showToast('Failed to save data', 'error');
    }
}

// Export all user data as JSON file
function exportUserData() {
    try {
        const userData = {
            timestamp: new Date().toISOString(),
            currentUser: state.currentUser,
            contacts: state.contacts,
            chats: state.chats,
            settings: state.settings
        };
        
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `modernchat-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        showToast('Data exported successfully!', 'success');
    } catch (e) {
        console.error('Failed to export data:', e);
        showToast('Failed to export data', 'error');
    }
}

// Import user data from JSON file
function importUserData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const userData = JSON.parse(e.target.result);
            
            // Validate data structure
            if (!userData.contacts || !userData.chats || !userData.settings) {
                showToast('Invalid backup file format', 'error');
                return;
            }
            
            // Ask for confirmation
            if (confirm('This will replace your current data. Continue?')) {
                // Import data
                if (userData.contacts) {
                    state.contacts = userData.contacts;
                    saveContactsToStorage();
                }
                
                if (userData.chats) {
                    state.chats = userData.chats;
                    saveChatsToStorage();
                }
                
                if (userData.settings) {
                    state.settings = userData.settings;
                    saveSettings();
                }
                
                // Reload UI
                renderChats();
                renderContacts();
                
                // Reload settings if open
                if (!document.getElementById('settingsModal').classList.contains('hidden')) {
                    loadSettings();
                }
                
                showToast('Data imported successfully!', 'success');
            }
        } catch (e) {
            console.error('Failed to import data:', e);
            showToast('Failed to import data. File might be corrupted.', 'error');
        }
    };
    
    reader.readAsText(file);
}

// Create a function to trigger import
function triggerDataImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = importUserData;
    input.click();
}

// ============================================
// CONTACT MANAGEMENT
// ============================================

function openAddContactModal() {
    const modal = document.getElementById('addContactModal');
    modal.classList.remove('hidden');
    
    // Generate contact link
    if (state.currentUser) {
        const contactLink = window.location.href + '?contact=' + state.currentUser.id;
        document.getElementById('myContactLink').value = contactLink;
    }
}

function closeAddContactModal() {
    const modal = document.getElementById('addContactModal');
    modal.classList.add('hidden');
    
    // Reset form
    document.getElementById('contactNameInput').value = '';
    document.getElementById('contactEmailInput').value = '';
}

function addContact() {
    const name = document.getElementById('contactNameInput').value.trim();
    const email = document.getElementById('contactEmailInput').value.trim();
    const status = document.getElementById('contactStatusInput').value;
    
    if (!name || !email) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showToast('Invalid email format', 'error');
        return;
    }
    
    // Check if contact already exists
    if (state.contacts.find(c => c.email === email)) {
        showToast('Contact with this email already exists', 'error');
        return;
    }
    
    // Create new contact
    const newContact = {
        id: Date.now(),
        name: name,
        email: email,
        avatar: generateAvatarUrl(email),
        status: status || 'offline'
    };
    
    state.contacts.push(newContact);
    saveContactsToStorage();
    renderContacts();
    
    closeAddContactModal();
    showToast(`Added ${name} to your contacts!`, 'success');
}

function copyMyContactLink() {
    const linkInput = document.getElementById('myContactLink');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999); // For mobile
    
    navigator.clipboard.writeText(linkInput.value).then(() => {
        showToast('Contact link copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        try {
            document.execCommand('copy');
            showToast('Contact link copied to clipboard!', 'success');
        } catch (err) {
            showToast('Failed to copy link', 'error');
        }
    });
}

// Check for contact links on page load
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const contactId = urlParams.get('contact');
    
    if (contactId && state.currentUser && state.currentUser.id.toString() !== contactId) {
        // Someone is trying to add us as a contact
        const contactName = prompt('What would you like to name this contact?');
        if (contactName) {
            const newContact = {
                id: parseInt(contactId),
                name: contactName,
                email: `user${contactId}@chat.local`,
                avatar: generateAvatarUrl(contactName),
                status: 'offline'
            };
            
            state.contacts.push(newContact);
            saveContactsToStorage();
            renderContacts();
            showToast(`${contactName} has been added to your contacts!`, 'success');
            
            // Clean URL
            window.history.replaceState({}, '', window.location.pathname);
        }
    }
});

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

