const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// Send a message
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!content || !receiverId) {
      return res.status(400).json({ error: 'Receiver and content are required' });
    }

    const message = new Message({
      sender: req.userId,
      receiver: receiverId,
      content
    });

    await message.save();

    // Populate sender and receiver info
    await message.populate('sender', 'username email');
    await message.populate('receiver', 'username email');

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Error sending message' });
  }
});

// Get conversation between two users
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    // Find all messages between current user and other user
    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: otherUserId },
        { sender: otherUserId, receiver: req.userId }
      ]
    })
      .populate('sender', 'username email')
      .populate('receiver', 'username email')
      .sort({ timestamp: 1 });

    res.json({ messages });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

// Get all conversations for current user
router.get('/conversations', auth, async (req, res) => {
  try {
    // Get all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: req.userId }, { receiver: req.userId }]
    })
      .populate('sender', 'username email')
      .populate('receiver', 'username email')
      .sort({ timestamp: -1 });

    // Group by conversation and get last message
    const conversationsMap = new Map();

    messages.forEach(message => {
      const otherUserId = message.sender._id.toString() === req.userId.toString()
        ? message.receiver._id.toString()
        : message.sender._id.toString();

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          user: message.sender._id.toString() === req.userId.toString()
            ? message.receiver
            : message.sender,
          lastMessage: message
        });
      }
    });

    const conversations = Array.from(conversationsMap.values());

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Error fetching conversations' });
  }
});

// Mark message as read
router.patch('/:messageId/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only receiver can mark as read
    if (message.receiver.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    message.read = true;
    await message.save();

    res.json({ message: 'Message marked as read', data: message });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Error marking message as read' });
  }
});

module.exports = router;