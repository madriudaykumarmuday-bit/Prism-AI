import { UserProfile, Conversation } from '../types';

// --- In-memory store to simulate a real database ---
const userStore = new Map<string, UserProfile>();
const conversationStore = new Map<string, Conversation>();
const MOCK_API_DELAY = 300; // ms

// Helper function to simulate network latency
const simulateDelay = <T>(data: T): Promise<T> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(data), MOCK_API_DELAY);
    });
};

export const addOrUpdateUser = async (user: UserProfile): Promise<UserProfile> => {
    userStore.set(user.id, user);
    return simulateDelay(user);
};

export const getUser = async (id: string): Promise<UserProfile | null> => {
    const user = userStore.get(id) || null;
    return simulateDelay(user);
};

// --- Conversation Functions ---

export const getConversations = async (userId: string): Promise<Conversation[]> => {
    const allConversations = Array.from(conversationStore.values());
    const userConversations = allConversations.filter(c => c.userId === userId);
    const sorted = userConversations.sort((a, b) => b.lastUpdated - a.lastUpdated);
    return simulateDelay(sorted);
};

export const saveConversation = async (conversation: Conversation): Promise<Conversation> => {
    conversationStore.set(conversation.id, conversation);
    return simulateDelay(conversation);
};

export const deleteConversation = async (id: string): Promise<void> => {
    conversationStore.delete(id);
    return simulateDelay(undefined);
};