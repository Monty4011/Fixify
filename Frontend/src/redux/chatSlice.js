import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        isChatOpen: false,
        selectedUserId: null,
        unreadMessages: {}, // Always an object
    },
    reducers: {
        openChat: (state, action) => {
            state.isChatOpen = true;
            state.selectedUserId = action.payload;
        },
        closeChat: (state) => {
            state.isChatOpen = false;
            state.selectedUserId = null;
        },
        setSelectedUserId: (state, action) => {
            state.selectedUserId = action.payload;
            if (action.payload && state.unreadMessages && state.unreadMessages[action.payload]) {
                delete state.unreadMessages[action.payload];
            }
        },
        addUnreadMessage: (state, action) => {
            const { senderId } = action.payload;
            state.unreadMessages = state.unreadMessages || {};
            state.unreadMessages[senderId] = (state.unreadMessages[senderId] || 0) + 1;
        },
        clearUnreadMessages: (state, action) => {
            const userId = action.payload;
            if (userId && state.unreadMessages && state.unreadMessages[userId]) {
                delete state.unreadMessages[userId];
            }
        },
        setUnreadMessages: (state, action) => {
            state.unreadMessages = action.payload || {};
        },
    },
});

export const { openChat, closeChat, setSelectedUserId, addUnreadMessage, clearUnreadMessages, setUnreadMessages } = chatSlice.actions;
export default chatSlice.reducer;