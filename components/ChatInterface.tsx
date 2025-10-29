/**
 * Real-time Chat Interface
 * 
 * Modern chat component for client-technician communication
 * Features message history, file sharing, typing indicators, and real-time updates
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
 ActivityIndicator,
 Alert,
 Animated,
 Dimensions,
 FlatList,
 Image,
 Modal,
 StyleSheet,
 Text,
 TextInput,
 TouchableOpacity,
 View
} from 'react-native';
import { useAuth } from '../contexts/SimpleAuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';

const { width } = Dimensions.get('window');

interface Message {
 id: string;
 senderId: string;
 senderName: string;
 message: string;
 timestamp: Date;
 type: 'text' | 'image' | 'location';
 status: 'sent' | 'delivered' | 'read' | 'sending';
 imageUrl?: string;
}

interface ChatInterfaceProps {
 bookingId: string;
 participantId: string;
 participantName: string;
 participantRole: 'client' | 'technician';
 onClose?: () => void;
}

export default function ChatInterface({ 
 bookingId, 
 participantId, 
 participantName, 
 participantRole,
 onClose 
}: ChatInterfaceProps) {
 const { user } = useAuth();
 const { sendMessage, onMessageReceived, onTypingReceived } = useWebSocket();
 const flatListRef = useRef<FlatList>(null);
 
 const [messages, setMessages] = useState<Message[]>([]);
 const [newMessage, setNewMessage] = useState<string>('');
 const [isTyping, setIsTyping] = useState<boolean>(false);
 const [participantTyping, setParticipantTyping] = useState<boolean>(false);
 const [isLoading, setIsLoading] = useState<boolean>(true);
 const [showImageModal, setShowImageModal] = useState<boolean>(false);
 const [selectedImage, setSelectedImage] = useState<string | null>(null);
 const [animatedValue] = useState(new Animated.Value(0));

 const loadChatHistory = useCallback(async () => {
 try {
 // Mock chat history - in real app, fetch from API
 const mockMessages: Message[] = [
 {
 id: '1',
 senderId: participantId,
 senderName: participantName,
 message: 'Hello! I\'m on my way to your location. I should arrive in about 15 minutes.',
 timestamp: new Date(Date.now() - 300000), // 5 minutes ago
 type: 'text' as const,
 status: 'delivered' as const
 },
 {
 id: '2',
 senderId: user?.id || 'unknown',
 senderName: user?.fullName || 'User',
 message: 'Great! I\'ll be waiting. The issue is with the main pipe in the kitchen.',
 timestamp: new Date(Date.now() - 240000), // 4 minutes ago
 type: 'text' as const,
 status: 'read' as const
 },
 {
 id: '3',
 senderId: participantId,
 senderName: participantName,
 message: 'Perfect. Could you send me a photo of the issue so I can prepare the right tools?',
 timestamp: new Date(Date.now() - 180000), // 3 minutes ago
 type: 'text' as const,
 status: 'delivered' as const
 },
 {
 id: '4',
 senderId: user?.id || 'unknown',
 senderName: user?.fullName || 'User',
 message: '',
 timestamp: new Date(Date.now() - 120000), // 2 minutes ago
 type: 'image' as const,
 imageUrl: 'https://via.placeholder.com/300x200/0d6efd/ffffff?text=Pipe+Issue',
 status: 'read' as const
 },
 {
 id: '5',
 senderId: participantId,
 senderName: participantName,
 message: 'Thanks for the photo! I can see the issue. I have the right parts with me.',
 timestamp: new Date(Date.now() - 60000), // 1 minute ago
 type: 'text' as const,
 status: 'delivered' as const
 }
 ];

 setMessages(mockMessages);
 setIsLoading(false);
 
 // Scroll to bottom after loading
 setTimeout(() => {
 flatListRef.current?.scrollToEnd({ animated: true });
 }, 100);
 } catch (error) {
 console.error('Error loading chat history:', error);
 setIsLoading(false);
 }
 }, [participantId, participantName, user?.id, user?.fullName]);

 const setupWebSocketListeners = useCallback(() => {
 onMessageReceived(bookingId, (message: Message) => {
 if (message.senderId !== user?.id) {
 setMessages(prev => [...prev, {
 ...message,
 id: Date.now().toString(),
 timestamp: new Date()
 }]);
 scrollToBottom();
 }
 });

 onTypingReceived(bookingId, (data: { userId: string; isTyping: boolean }) => {
 if (data.userId !== user?.id) {
 setParticipantTyping(data.isTyping);
 }
 });
 }, [bookingId, user?.id, onMessageReceived, onTypingReceived]);

 const cleanupWebSocketListeners = useCallback(() => {
 // In real app, cleanup WebSocket listeners
 }, []);

 const startAnimation = useCallback(() => {
 Animated.loop(
 Animated.sequence([
 Animated.timing(animatedValue, {
 toValue: 1,
 duration: 1000,
 useNativeDriver: true,
 }),
 Animated.timing(animatedValue, {
 toValue: 0,
 duration: 1000,
 useNativeDriver: true,
 }),
 ])
 ).start();
 }, [animatedValue]);

 useEffect(() => {
 loadChatHistory();
 setupWebSocketListeners();
 startAnimation();
 
 return () => {
 cleanupWebSocketListeners();
 };
 }, [loadChatHistory, setupWebSocketListeners, startAnimation, cleanupWebSocketListeners]);

 const scrollToBottom = () => {
 setTimeout(() => {
 flatListRef.current?.scrollToEnd({ animated: true });
 }, 100);
 };

 const handleSendMessage = () => {
 const message = newMessage.trim();
 if (!message) return;

 const messageData: Message = {
 id: Date.now().toString(),
 senderId: user?.id || 'unknown',
 senderName: user?.fullName || 'User',
 message: message,
 timestamp: new Date(),
 type: 'text' as const,
 status: 'sent' as const
 };

 setMessages(prev => [...prev, messageData]);
 setNewMessage('');
 scrollToBottom();

 // Send via WebSocket
 sendMessage(bookingId, {
 message: message,
 type: 'text',
 recipientId: participantId
 });

 // Simulate message status updates
 setTimeout(() => {
 setMessages(prev => prev.map(msg => 
 msg.id === messageData.id ? { ...msg, status: 'delivered' } : msg
 ));
 }, 1000);

 setTimeout(() => {
 setMessages(prev => prev.map(msg => 
 msg.id === messageData.id ? { ...msg, status: 'read' } : msg
 ));
 }, 3000);
 };

 const handleTyping = (text: string) => {
 setNewMessage(text);
 
 if (!isTyping && text.length > 0) {
 setIsTyping(true);
 // Send typing indicator
 sendMessage(bookingId, {
 type: 'typing',
 isTyping: true,
 recipientId: participantId
 });
 } else if (isTyping && text.length === 0) {
 setIsTyping(false);
 sendMessage(bookingId, {
 type: 'typing',
 isTyping: false,
 recipientId: participantId
 });
 }
 };

 const handleImageShare = () => {
 Alert.alert(
 'Share Image',
 'Choose an option',
 [
 { text: 'Camera', onPress: () => captureImage('camera') },
 { text: 'Gallery', onPress: () => captureImage('gallery') },
 { text: 'Cancel', style: 'cancel' }
 ]
 );
 };

 const captureImage = (source: string) => {
 // Mock image capture - in real app, use expo-image-picker
 const mockImageMessage: Message = {
 id: Date.now().toString(),
 senderId: user?.id || 'unknown',
 senderName: user?.fullName || 'User',
 message: '',
 timestamp: new Date(),
 type: 'image' as const,
 imageUrl: 'https://via.placeholder.com/300x200/10b981/ffffff?text=Shared+Image',
 status: 'sent' as const
 };

 setMessages(prev => [...prev, mockImageMessage]);
 scrollToBottom();

 // Send via WebSocket
 sendMessage(bookingId, {
 type: 'image',
 imageUrl: mockImageMessage.imageUrl,
 recipientId: participantId
 });
 };

 const formatTime = (timestamp: Date) => {
 return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
 };

 const renderMessage = ({ item, index }: { item: Message; index: number }) => {
 const isOwnMessage = item.senderId === user?.id;
 const showTimestamp = index === 0 || 
 new Date(item.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() > 300000; // 5 minutes

 return (
 <View style={styles.messageContainer}>
 {showTimestamp && (
 <Text style={styles.timestamp}>
 {formatTime(new Date(item.timestamp))}
 </Text>
 )}
 
 <View style={[
 styles.messageBubble,
 isOwnMessage ? styles.ownMessage : styles.otherMessage
 ]}>
 {!isOwnMessage && (
 <Text style={styles.senderName}>{item.senderName}</Text>
 )}
 
 {item.type === 'text' ? (
 <Text style={[
 styles.messageText,
 isOwnMessage ? styles.ownMessageText : styles.otherMessageText
 ]}>
 {item.message}
 </Text>
 ) : (
 <TouchableOpacity
 onPress={() => {
 setSelectedImage(item.imageUrl || null);
 setShowImageModal(true);
 }}
 >
 <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
 </TouchableOpacity>
 )}
 
 {isOwnMessage && (
 <View style={styles.messageStatus}>
 {item.status === 'sending' && (
 <ActivityIndicator size="small" color="#6b7280" />
 )}
 {item.status === 'delivered' && (
 <Ionicons name="checkmark" size={16} color="#6b7280" />
 )}
 {item.status === 'read' && (
 <Ionicons name="checkmark-done" size={16} color="#0d6efd" />
 )}
 </View>
 )}
 </View>
 </View>
 );
 };

 const renderTypingIndicator = () => {
 if (!participantTyping) return null;

 return (
 <View style={[styles.messageBubble, styles.otherMessage, styles.typingBubble]}>
 <Text style={styles.senderName}>{participantName}</Text>
 <View style={styles.typingContainer}>
 <Animated.View style={[
 styles.typingDot,
 {
 opacity: animatedValue.interpolate({
 inputRange: [0, 1],
 outputRange: [0.3, 1]
 })
 }
 ]} />
 <Animated.View style={[
 styles.typingDot,
 {
 opacity: animatedValue.interpolate({
 inputRange: [0, 0.5, 1],
 outputRange: [0.3, 1, 0.3]
 })
 }
 ]} />
 <Animated.View style={[
 styles.typingDot,
 {
 opacity: animatedValue.interpolate({
 inputRange: [0, 1],
 outputRange: [1, 0.3]
 })
 }
 ]} />
 <Text style={styles.typingText}>typing...</Text>
 </View>
 </View>
 );
 };

 if (isLoading) {
 return (
 <View style={[styles.container, styles.centered]}>
 <ActivityIndicator size="large" color="#0d6efd" />
 <Text style={styles.loadingText}>Loading chat...</Text>
 </View>
 );
 }

 return (
 <View style={styles.container}>
 {/* Header */}
 <View style={styles.header}>
 <TouchableOpacity onPress={onClose} style={styles.backButton}>
 <Ionicons name="arrow-back" size={24} color="#fff" />
 </TouchableOpacity>
 <View style={styles.participantInfo}>
 <Text style={styles.participantName}>{participantName}</Text>
 <Text style={styles.participantRole}>
 {participantRole === 'technician' ? 'Technician' : 'Client'}
 </Text>
 </View>
 <TouchableOpacity style={styles.callButton}>
 <Ionicons name="call" size={20} color="#fff" />
 </TouchableOpacity>
 </View>

 {/* Messages */}
 <FlatList
 ref={flatListRef}
 data={messages}
 renderItem={renderMessage}
 keyExtractor={(item) => item.id}
 style={styles.messagesList}
 contentContainerStyle={styles.messagesContent}
 showsVerticalScrollIndicator={false}
 ListFooterComponent={renderTypingIndicator}
 />

 {/* Input */}
 <View style={styles.inputContainer}>
 <TouchableOpacity
 style={styles.attachButton}
 onPress={handleImageShare}
 >
 <Ionicons name="camera" size={24} color="#6b7280" />
 </TouchableOpacity>
 
 <TextInput
 style={styles.textInput}
 placeholder="Type a message..."
 value={newMessage}
 onChangeText={handleTyping}
 multiline
 maxLength={500}
 />
 
 <TouchableOpacity
 style={[
 styles.sendButton,
 newMessage.trim() ? styles.sendButtonActive : styles.sendButtonInactive
 ]}
 onPress={handleSendMessage}
 disabled={!newMessage.trim()}
 >
 <Ionicons 
 name="send" 
 size={20} 
 color={newMessage.trim() ? "#fff" : "#9ca3af"} 
 />
 </TouchableOpacity>
 </View>

 {/* Image Modal */}
 <Modal
 visible={showImageModal}
 transparent
 animationType="fade"
 onRequestClose={() => setShowImageModal(false)}
 >
 <View style={styles.imageModal}>
 <TouchableOpacity
 style={styles.imageModalBackground}
 onPress={() => setShowImageModal(false)}
 >
 {selectedImage && (
 <Image source={{ uri: selectedImage }} style={styles.fullImage} />
 )}
 <TouchableOpacity
 style={styles.closeImageButton}
 onPress={() => setShowImageModal(false)}
 >
 <Ionicons name="close" size={24} color="#fff" />
 </TouchableOpacity>
 </TouchableOpacity>
 </View>
 </Modal>
 </View>
 );
}

const styles = StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: '#f8f9fa',
 },
 centered: {
 justifyContent: 'center',
 alignItems: 'center',
 },
 header: {
 flexDirection: 'row',
 alignItems: 'center',
 backgroundColor: '#0d6efd',
 paddingTop: 50,
 paddingBottom: 15,
 paddingHorizontal: 15,
 },
 backButton: {
 marginRight: 15,
 },
 participantInfo: {
 flex: 1,
 },
 participantName: {
 fontSize: 18,
 fontWeight: '600',
 color: '#fff',
 },
 participantRole: {
 fontSize: 14,
 color: '#bfdbfe',
 },
 callButton: {
 backgroundColor: 'rgba(255, 255, 255, 0.2)',
 padding: 10,
 borderRadius: 20,
 },
 loadingText: {
 marginTop: 10,
 fontSize: 16,
 color: '#6b7280',
 },
 messagesList: {
 flex: 1,
 },
 messagesContent: {
 padding: 15,
 },
 messageContainer: {
 marginBottom: 15,
 },
 timestamp: {
 fontSize: 12,
 color: '#9ca3af',
 textAlign: 'center',
 marginBottom: 10,
 },
 messageBubble: {
 maxWidth: width * 0.75,
 padding: 12,
 borderRadius: 18,
 marginBottom: 4,
 },
 ownMessage: {
 alignSelf: 'flex-end',
 backgroundColor: '#0d6efd',
 },
 otherMessage: {
 alignSelf: 'flex-start',
 backgroundColor: '#fff',
 borderWidth: 1,
 borderColor: '#e5e7eb',
 },
 senderName: {
 fontSize: 12,
 fontWeight: '500',
 color: '#6b7280',
 marginBottom: 4,
 },
 messageText: {
 fontSize: 16,
 lineHeight: 20,
 },
 ownMessageText: {
 color: '#fff',
 },
 otherMessageText: {
 color: '#111827',
 },
 messageImage: {
 width: 200,
 height: 150,
 borderRadius: 12,
 },
 messageStatus: {
 alignSelf: 'flex-end',
 marginTop: 4,
 },
 typingBubble: {
 backgroundColor: '#f3f4f6',
 },
 typingContainer: {
 flexDirection: 'row',
 alignItems: 'center',
 },
 typingDot: {
 width: 6,
 height: 6,
 borderRadius: 3,
 backgroundColor: '#6b7280',
 marginRight: 4,
 },
 typingText: {
 fontSize: 14,
 color: '#6b7280',
 marginLeft: 4,
 fontStyle: 'italic',
 },
 inputContainer: {
 flexDirection: 'row',
 alignItems: 'flex-end',
 backgroundColor: '#fff',
 paddingHorizontal: 15,
 paddingVertical: 10,
 borderTopWidth: 1,
 borderTopColor: '#e5e7eb',
 },
 attachButton: {
 backgroundColor: '#f9fafb',
 padding: 10,
 borderRadius: 20,
 marginRight: 10,
 marginBottom: 5,
 },
 textInput: {
 flex: 1,
 backgroundColor: '#f9fafb',
 borderRadius: 20,
 paddingHorizontal: 15,
 paddingVertical: 10,
 maxHeight: 100,
 fontSize: 16,
 borderWidth: 1,
 borderColor: '#e5e7eb',
 },
 sendButton: {
 padding: 10,
 borderRadius: 20,
 marginLeft: 10,
 marginBottom: 5,
 },
 sendButtonActive: {
 backgroundColor: '#0d6efd',
 },
 sendButtonInactive: {
 backgroundColor: '#f3f4f6',
 },
 imageModal: {
 flex: 1,
 backgroundColor: 'rgba(0, 0, 0, 0.9)',
 justifyContent: 'center',
 alignItems: 'center',
 },
 imageModalBackground: {
 flex: 1,
 width: '100%',
 justifyContent: 'center',
 alignItems: 'center',
 },
 fullImage: {
 width: width * 0.9,
 height: width * 0.9 * 0.75,
 borderRadius: 12,
 },
 closeImageButton: {
 position: 'absolute',
 top: 50,
 right: 20,
 backgroundColor: 'rgba(0, 0, 0, 0.5)',
 padding: 10,
 borderRadius: 20,
 },
});
