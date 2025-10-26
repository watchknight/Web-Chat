// ============================================
// FIREBASE CONFIGURATION
// ============================================

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Your web app's Firebase configuration
// REPLACE THESE WITH YOUR ACTUAL FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getDatabase(app);
const auth = getAuth(app);

// Firebase helper functions
const FirebaseService = {
    // ============================================
    // AUTHENTICATION
    // ============================================
    
    async signUp(email, password, username) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Create user profile in database
            await this.set(`users/${user.uid}`, {
                email: email,
                username: username,
                createdAt: Date.now()
            });
            
            return user;
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        }
    },
    
    async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    },
    
    async signOut() {
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    },
    
    onAuthStateChanged(callback) {
        return onAuthStateChanged(auth, callback);
    },
    
    getCurrentUser() {
        return auth.currentUser;
    },
    
    // ============================================
    // DATABASE OPERATIONS
    // ============================================
    
    async set(path, data) {
        const { ref, set } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
        await set(ref(db, path), data);
    },
    
    async get(path) {
        const { ref, get } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
        const snapshot = await get(ref(db, path));
        return snapshot.exists() ? snapshot.val() : null;
    },
    
    async push(path, data) {
        const { ref, push, set } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
        const newRef = push(ref(db, path));
        await set(newRef, data);
        return newRef.key;
    },
    
    async update(path, data) {
        const { ref, update } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
        await update(ref(db, path), data);
    },
    
    async remove(path) {
        const { ref, remove } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
        await remove(ref(db, path));
    },
    
    on(path, callback) {
        // Dynamically import Firebase modules
        import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js').then(({ ref, onValue }) => {
            const unsubscribe = onValue(ref(db, path), (snapshot) => {
                callback(snapshot.exists() ? snapshot.val() : null);
            });
            return unsubscribe;
        });
    },
    
    // ============================================
    // CHAT SPECIFIC FUNCTIONS
    // ============================================
    
    async sendMessage(chatId, userId, message, timestamp, sent) {
        const messageData = {
            text: message,
            userId: userId,
            timestamp: timestamp,
            sent: sent
        };
        
        return await this.push(`chats/${chatId}/messages`, messageData);
    },
    
    async loadMessages(chatId) {
        return await this.get(`chats/${chatId}/messages`);
    },
    
    async onMessages(chatId, callback) {
        return this.on(`chats/${chatId}/messages`, (messages) => {
            if (messages) {
                // Convert object to array
                const messagesArray = Object.keys(messages).map(key => ({
                    id: key,
                    ...messages[key]
                }));
                callback(messagesArray);
            } else {
                callback([]);
            }
        });
    },
    
    async createChat(userId, contactId, contactName, contactAvatar) {
        const chatId = `${userId}_${contactId}`;
        const chatData = {
            userId: userId,
            contactId: contactId,
            contactName: contactName,
            contactAvatar: contactAvatar,
            createdAt: Date.now(),
            lastMessage: '',
            lastMessageTime: Date.now()
        };
        
        await this.set(`chats/${chatId}`, chatData);
        return chatId;
    },
    
    async getUserChats(userId) {
        const allChats = await this.get('chats');
        if (!allChats) return [];
        
        // Filter chats for this user
        const userChats = Object.keys(allChats)
            .filter(chatId => chatId.includes(userId))
            .map(chatId => ({
                id: chatId,
                ...allChats[chatId]
            }));
            
        return userChats;
    },
    
    async addContact(userId, contactEmail, contactName) {
        const contactId = `contact_${Date.now()}`;
        const contactData = {
            userId: userId,
            email: contactEmail,
            name: contactName,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(contactName)}&background=007bff&color=fff&size=128`,
            createdAt: Date.now()
        };
        
        await this.set(`users/${userId}/contacts/${contactId}`, contactData);
        return contactId;
    }
};

// Export for use
window.FirebaseService = FirebaseService;
window.firebaseAuth = auth;
window.firebaseDb = db;

