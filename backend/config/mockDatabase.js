/**
 * Simple Mock Database Service
 * Provides in-memory storage for testing without MongoDB
 */

class MockDatabase {
  constructor() {
    this.users = [
      {
        _id: '1',
        email: 'admin@quickfix.com',
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdGOWvOc4k.W9G6', // admin123
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        phoneNumber: '+1234567890',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '2',
        email: 'client@quickfix.com',
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdGOWvOc4k.W9G6', // client123
        firstName: 'John',
        lastName: 'Client',
        role: 'client',
        phoneNumber: '+1234567891',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '3',
        email: 'tech@quickfix.com',
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdGOWvOc4k.W9G6', // tech123
        firstName: 'Mike',
        lastName: 'Technician',
        role: 'technician',
        phoneNumber: '+1234567892',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    this.serviceRequests = [];
    this.notifications = [];
    this.isConnected = false;
  }

  async connect() {
    console.log('📦 MockDatabase: Connected to in-memory database');
    this.isConnected = true;
    return true;
  }

  async disconnect() {
    console.log('📦 MockDatabase: Disconnected from in-memory database');
    this.isConnected = false;
    return true;
  }

  // User operations
  async findUserByEmail(email) {
    return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  async createUser(userData) {
    const newUser = {
      ...userData,
      _id: String(this.users.length + 1),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  async findUserById(id) {
    return this.users.find(user => user._id === id);
  }

  // Service request operations
  async createServiceRequest(requestData) {
    const newRequest = {
      ...requestData,
      _id: String(this.serviceRequests.length + 1),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.serviceRequests.push(newRequest);
    return newRequest;
  }

  async findServiceRequests(query = {}) {
    return this.serviceRequests.filter(request => {
      for (let key in query) {
        if (request[key] !== query[key]) return false;
      }
      return true;
    });
  }

  // Notification operations
  async createNotification(notificationData) {
    const newNotification = {
      ...notificationData,
      _id: String(this.notifications.length + 1),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.notifications.push(newNotification);
    return newNotification;
  }

  async findNotifications(query = {}) {
    return this.notifications.filter(notification => {
      for (let key in query) {
        if (notification[key] !== query[key]) return false;
      }
      return true;
    });
  }
}

module.exports = new MockDatabase();
