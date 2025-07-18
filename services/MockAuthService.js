/**
 * Mock Authentication Service
 * Provides offline authentication for testing without backend server
 */

// Mock user database
const MOCK_USERS = {
  'admin@quickfix.com': {
    id: '1',
    email: 'admin@quickfix.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    phone: '+1234567890',
    isActive: true
  },
  'client@quickfix.com': {
    id: '2',
    email: 'client@quickfix.com',
    password: 'client123',
    firstName: 'John',
    lastName: 'Client',
    role: 'client',
    phone: '+1234567891',
    isActive: true
  },
  'tech@quickfix.com': {
    id: '3',
    email: 'tech@quickfix.com',
    password: 'tech123',
    firstName: 'Mike',
    lastName: 'Technician',
    role: 'technician',
    phone: '+1234567892',
    isActive: true
  }
};

// Mock JWT token generator
const generateMockToken = (user) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    iat: Date.now() / 1000,
    exp: (Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  }));
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
};

// Mock API responses
export const mockAuthService = {
  async login(email, password) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = MOCK_USERS[email.toLowerCase()];
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.password !== password) {
      throw new Error('Invalid password');
    }
    
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }
    
    const token = generateMockToken(user);
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      success: true,
      data: {
        user: userWithoutPassword,
        token: token
      },
      message: 'Login successful'
    };
  },

  async register(userData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (MOCK_USERS[userData.email.toLowerCase()]) {
      throw new Error('User already exists');
    }
    
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      role: userData.role || 'client',
      isActive: true
    };
    
    // In real app, this would save to database
    MOCK_USERS[userData.email.toLowerCase()] = newUser;
    
    const token = generateMockToken(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    
    return {
      success: true,
      data: {
        user: userWithoutPassword,
        token: token
      },
      message: 'Registration successful'
    };
  },

  async verifyToken(token) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const payload = JSON.parse(atob(parts[1]));
      
      // Check if token is expired
      if (payload.exp < Date.now() / 1000) {
        throw new Error('Token expired');
      }
      
      const user = Object.values(MOCK_USERS).find(u => u.id === payload.id);
      if (!user) {
        throw new Error('User not found');
      }
      
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        success: true,
        data: {
          user: userWithoutPassword,
          token: token
        }
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  },

  async logout() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      message: 'Logout successful'
    };
  },

  // Mock admin functions
  async getAllUsers() {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const users = Object.values(MOCK_USERS).map(user => {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return {
      success: true,
      data: users
    };
  },

  async updateUserStatus(userId, isActive) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = Object.values(MOCK_USERS).find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    user.isActive = isActive;
    
    return {
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    };
  }
};

// Export for use in other components
export default mockAuthService;
