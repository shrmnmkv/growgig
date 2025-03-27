import mongoose from 'mongoose';

export interface IMessage extends mongoose.Document {
  senderId: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
}

export interface IChat extends mongoose.Document {
  participants: mongoose.Types.ObjectId[];
  messages: IMessage[];
  lastMessage: IMessage;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  messages: [messageSchema],
  lastMessage: {
    type: messageSchema,
    default: null,
  },
}, {
  timestamps: true,
});

// Ensure unique chat between two participants
chatSchema.index({ participants: 1 }, { unique: true });

export const Chat = mongoose.model<IChat>('Chat', chatSchema); 