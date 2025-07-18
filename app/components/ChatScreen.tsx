/**
 * Real-time Chat Component
 * 
 * This component provides real-time chat functionality including:
 * - Text messaging
 * - Image sharing
 * - Location sharing
 * - Typing indicators
 * - Message status indicators
 */

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Linking,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useWebSocket } from '../contexts/WebSocketContext';

interface ChatScreenProps {
  route: {
    params: {
      bookingId: string;
      otherUser: {
        id: string;
        firstName: string;
        lastName: string;
        [key: string]: any;
      };
    };
  };
  navigation: {
    goBack: () => void;
    [key: string]: any;
  };
}

interface Message {
  _id: string;
  bookingId: string;
  senderId: string;
  recipientId: string;
  content: string;
  messageType: 'text' | 'image' | 'location';
  attachments?: { url: string }[];
  location?: { latitude: number; longitude: number };
  status?: string;
  readAt?: string | null;
  createdAt: string;
  [key: string]: any;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { bookingId, otherUser } = route.params;
  const { socket, connected, joinRoom, leaveRoom = () => {}, sendMessage } = useWebSocket();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [typing, setTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const flatListRef = useRef<any>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    initializeChat();
    return () => {
      if (bookingId) {
        leaveRoom(`booking_${bookingId}`);
      }
    };
  }, []);

  useEffect(() => {
    if (socket && connected && bookingId) {
      joinRoom(`booking_${bookingId}`);
      setupSocketListeners();
    }
  }, [socket, connected, bookingId]);

  const initializeChat = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        setCurrentUser(JSON.parse(userString));
      }
      
      await fetchChatHistory();
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(
        `${__DEV__ ? 'http://localhost:3000' : 'https://your-server.com'}/api/chat/${bookingId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  };

  const setupSocketListeners = () => {
    if (!socket) return;

    socket.on('new_message', (data: Message) => {
      if (data.bookingId === bookingId) {
        setMessages(prev => [data, ...prev]);
        markMessageAsRead(data._id);
      }
    });

    socket.on('message_status_updated', (data: { messageId: string; status: string; readAt?: string | null }) => {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, status: data.status, readAt: data.readAt }
            : msg
        )
      );
    });

    socket.on('user_typing', (data: { bookingId: string; userId: string }) => {
      if (data.bookingId === bookingId && data.userId !== currentUser?.id) {
        setOtherUserTyping(true);
        setTimeout(() => setOtherUserTyping(false), 3000);
      }
    });

    socket.on('user_stopped_typing', (data: { bookingId: string; userId: string }) => {
      if (data.bookingId === bookingId && data.userId !== currentUser?.id) {
        setOtherUserTyping(false);
      }
    });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !connected) return;

    const message = {
      bookingId,
      content: inputMessage.trim(),
      messageType: 'text',
      recipientId: otherUser.id
    };

    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(
        `${__DEV__ ? 'http://localhost:3000' : 'https://your-server.com'}/api/chat/send`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(message)
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [data.data.message, ...prev]);
        setInputMessage('');
        stopTyping();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleTyping = () => {
    if (!typing) {
      setTyping(true);
      socket?.emit('typing', { bookingId, userId: currentUser?.id });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const stopTyping = () => {
    if (typing) {
      setTyping(false);
      socket?.emit('stop_typing', { bookingId, userId: currentUser?.id });
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      await fetch(
        `${__DEV__ ? 'http://localhost:3000' : 'https://your-server.com'}/api/chat/messages/${messageId}/read`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      await sendImageMessage(result.assets[0].uri);
    }
  };

  const sendImageMessage = async (imageUri: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const formData = new FormData();
      
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'chat-image.jpg',
      } as any);
      
      formData.append('bookingId', bookingId);
      formData.append('recipientId', otherUser.id);
      formData.append('messageType', 'image');

      const response = await fetch(
        `${__DEV__ ? 'http://localhost:3000' : 'https://your-server.com'}/api/chat/send-image`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [data.data.message, ...prev]);
      }
    } catch (error) {
      console.error('Failed to send image:', error);
      Alert.alert('Error', 'Failed to send image');
    }
  };

  const handleLocationShare = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access location');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      await sendLocationMessage(location);
    } catch (error) {
      console.error('Failed to get location:', error);
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const sendLocationMessage = async (location: Location.LocationObject) => {
    const message = {
      bookingId,
      content: 'Shared location',
      messageType: 'location',
      recipientId: otherUser.id,
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      }
    };

    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(
        `${__DEV__ ? 'http://localhost:3000' : 'https://your-server.com'}/api/chat/send`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(message)
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [data.data.message, ...prev]);
      }
    } catch (error) {
      console.error('Failed to send location:', error);
      Alert.alert('Error', 'Failed to send location');
    }
  };

  const openMap = (latitude: number, longitude: number) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}`
    });
    
    if (url) {
      Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Unable to open map on this platform.');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === currentUser?.id;
    const messageTime = new Date(item.createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.otherMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          {item.messageType === 'text' && (
            <Text style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText
            ]}>
              {item.content}
            </Text>
          )}
          
          {item.messageType === 'image' && item.attachments && item.attachments.length > 0 && (
            <TouchableOpacity>
              <Image source={{ uri: item.attachments[0]?.url }} style={styles.messageImage} />
            </TouchableOpacity>
          )}
          
          {item.messageType === 'location' && (
            <TouchableOpacity
              style={styles.locationMessage}
              onPress={() => {
                if (item.location) {
                  openMap(item.location.latitude, item.location.longitude);
                }
              }}
              disabled={!item.location}
            >
              <Ionicons name="location" size={20} color="#0d6efd" />
              <Text style={styles.locationText}>View Location</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>{messageTime}</Text>
            {isMyMessage && (
              <Ionicons
                name={item.readAt ? "checkmark-done" : "checkmark"}
                size={16}
                color={item.readAt ? "#0d6efd" : "#999"}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{otherUser.firstName} {otherUser.lastName}</Text>
          <Text style={styles.headerSubtitle}>
            {connected ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          inverted
        />

        {otherUserTyping && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>{otherUser.firstName} is typing...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleImagePicker}
          >
            <Ionicons name="camera" size={24} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleLocationShare}
          >
            <Ionicons name="location" size={24} color="#666" />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            value={inputMessage}
            onChangeText={(text) => {
              setInputMessage(text);
              handleTyping();
            }}
            placeholder="Type a message..."
            multiline
            maxLength={1000}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              inputMessage.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            onPress={handleSendMessage}
            disabled={!inputMessage.trim() || !connected}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputMessage.trim() && connected ? "white" : "#ccc"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    minWidth: 60,
  },
  myMessageBubble: {
    backgroundColor: '#0d6efd',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#f1f3f4',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#333',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 4,
  },
  locationMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 4,
  },
  locationText: {
    marginLeft: 8,
    color: '#0d6efd',
    fontWeight: '500',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
    marginRight: 4,
  },
  typingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#0d6efd',
  },
  sendButtonInactive: {
    backgroundColor: '#f1f3f4',
  },
});

export default ChatScreen;
