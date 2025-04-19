import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";

export const send = async (req, res) => {
    const { receiverId, message } = req.body;
    const senderId = req.id;

    try {
        const newMessage = new Message({ senderId, receiverId, message });
        await newMessage.save();
        const io = req.app.get('socketio');
        io.to(receiverId).emit('message', { senderId, receiverId, message, timestamp: new Date() });
        io.to(senderId).emit('message', { senderId, receiverId, message, timestamp: new Date() });
        res.status(200).json({ success: true, message: newMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
}

export const getChatHistory = async (req, res) => {
    const { otherUserId } = req.params;
    const senderId = req.id;

    try {
        const messages = await Message.find({
            $or: [
                { senderId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: senderId }
            ]
        }).sort({ timestamp: 1 });
        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
}

export const getChatUsers = async (req, res) => {
    const userId = req.id;

    try {
        // Find distinct sender and receiver IDs from messages involving this user
        const senderIds = await Message.find({ receiverId: userId }).distinct('senderId');
        const receiverIds = await Message.find({ senderId: userId }).distinct('receiverId');
        const chatUserIds = [...new Set([...senderIds, ...receiverIds])];

        // Fetch user/worker details
        const users = await User.find({ _id: { $in: chatUserIds } }, 'fullname');
        const chatUsers = users.map(user => ({
            _id: user._id,
            fullname: user.fullname,
            type: 'user' // We can add logic to check if user is a worker
        }));

        res.status(200).json({ success: true, chatUsers });
    } catch (error) {
        console.error('Error fetching chat users:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch chat users' });
    }
}