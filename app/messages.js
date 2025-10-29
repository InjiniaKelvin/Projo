import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
 FlatList,
 StyleSheet,
 Text,
 TextInput,
 TouchableOpacity,
 View
} from 'react-native';
import { useAuth } from '../contexts/SimpleAuthContext';

export default function MessagesScreen() {
 const { user } = useAuth();
 const router = useRouter();
 const [messageText, setMessageText] = useState('');
 const [messages, setMessages] = useState([
 {
 id: '1',
 text: 'Welcome to QuickFix Chat! You can communicate with technicians here.',
 sender: 'system',
 timestamp: new Date().toISOString(),
 }
 ]);

 const sendMessage = () => {
 if (messageText.trim()) {
 const newMessage = {
 id: Date.now().toString(),
 text: messageText.trim(),
 sender: 'user',
 timestamp: new Date().toISOString(),
 };
 setMessages(prev => [...prev, newMessage]);
 setMessageText('');
 
 // Simulate a response after 2 seconds
 setTimeout(() => {
 const responseMessage = {
 id: (Date.now() + 1).toString(),
 text: 'Thank you for your message. A technician will respond shortly.',
 sender: 'technician',
 timestamp: new Date().toISOString(),
 };
 setMessages(prev => [...prev, responseMessage]);
 }, 2000);
 }
 };

 const renderMessage = ({ item }) => (
 <View style={[
 styles.messageContainer,
 item.sender === 'user' ? styles.userMessage : styles.otherMessage
 ]}>
 <Text style={[
 styles.messageText,
 item.sender === 'user' ? styles.userMessageText : styles.otherMessageText
 ]}>
 {item.text}
 </Text>
 <Text style={styles.timestamp}>
 {new Date(item.timestamp).toLocaleTimeString()}
 </Text>
 </View>
 );

 return (
 <View style={styles.container}>
 {/* Header */}
 <View style={styles.header}>
 <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
 <Ionicons name="arrow-back" size={24} color="#fff" />
 </TouchableOpacity>
 <Text style={styles.headerTitle}>Messages</Text>
 <View style={styles.placeholder} />
 </View>

 {/* Messages List */}
 <FlatList
 data={messages}
 renderItem={renderMessage}
 keyExtractor={item => item.id}
 style={styles.messagesList}
 contentContainerStyle={styles.messagesContent}
 />

 {/* Message Input */}
 <View style={styles.inputContainer}>
 <TextInput
 style={styles.textInput}
 value={messageText}
 onChangeText={setMessageText}
 placeholder="Type your message..."
 multiline
 maxLength={500}
 />
 <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
 <Ionicons name="send" size={24} color="#fff" />
 </TouchableOpacity>
 </View>
 </View>
 );
}

const styles = StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: '#f8f9fa',
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
 headerTitle: {
 flex: 1,
 fontSize: 20,
 fontWeight: 'bold',
 color: '#fff',
 textAlign: 'center',
 },
 placeholder: {
 width: 39, // Same width as back button for centering
 },
 messagesList: {
 flex: 1,
 },
 messagesContent: {
 padding: 15,
 },
 messageContainer: {
 marginVertical: 5,
 padding: 12,
 borderRadius: 12,
 maxWidth: '80%',
 },
 userMessage: {
 alignSelf: 'flex-end',
 backgroundColor: '#0d6efd',
 },
 otherMessage: {
 alignSelf: 'flex-start',
 backgroundColor: '#e9ecef',
 },
 messageText: {
 fontSize: 16,
 lineHeight: 20,
 },
 userMessageText: {
 color: '#fff',
 },
 otherMessageText: {
 color: '#333',
 },
 timestamp: {
 fontSize: 12,
 color: '#6c757d',
 marginTop: 5,
 },
 inputContainer: {
 flexDirection: 'row',
 alignItems: 'flex-end',
 padding: 15,
 backgroundColor: '#fff',
 borderTopWidth: 1,
 borderTopColor: '#e9ecef',
 },
 textInput: {
 flex: 1,
 borderWidth: 1,
 borderColor: '#ced4da',
 borderRadius: 20,
 paddingHorizontal: 15,
 paddingVertical: 10,
 marginRight: 10,
 maxHeight: 100,
 fontSize: 16,
 },
 sendButton: {
 backgroundColor: '#0d6efd',
 width: 44,
 height: 44,
 borderRadius: 22,
 justifyContent: 'center',
 alignItems: 'center',
 },
});
