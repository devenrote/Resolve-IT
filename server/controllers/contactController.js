const { createContactMessage } = require('../models/contactModel');

const submitContactMessage = async (req, res) => {
  try {
    const { email, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({ message: 'email and message are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (message.trim().length < 5) {
      return res.status(400).json({ message: 'Message must be at least 5 characters long' });
    }

    await createContactMessage({ email: email.trim(), message: message.trim() });
    return res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to send message' });
  }
};

module.exports = {
  submitContactMessage,
};
