import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../contexts/SimpleAuthContext';

// Type declaration for JSX intrinsic elements on web
declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    }
  }
}

export default function Index() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  console.log('Index: isLoading:', isLoading, 'user:', user, 'showSplash:', showSplash);

  const handleGetStarted = () => {
    console.log('🔥 Index: Get Started button pressed! Setting showSplash to false');
    setShowSplash(false);
  };

  useEffect(() => {
    console.log('Index: useEffect triggered, isLoading:', isLoading, 'user:', user, 'showSplash:', showSplash);
    
    // Only proceed with navigation if loading is complete and splash is dismissed
    if (!showSplash && !isLoading) {
      console.log('Index: Ready to navigate - user authenticated:', !!user);
      
      // Add a delay and use a more robust navigation approach
      const timer = setTimeout(() => {
        try {
          if (user && user.role) {
            console.log('Index: User authenticated with role:', user.role, 'navigating to dashboard');
            // Use push instead of replace to avoid router state issues
            const dashboardRoute = user.role === 'admin' ? '/dashboard/admin' :
                                 user.role === 'technician' ? '/dashboard/technician' :
                                 '/dashboard/client';
            router.push(dashboardRoute);
          } else {
            console.log('Index: No user or role, navigating to auth');
            router.push('/auth/login');
          }
        } catch (error) {
          console.error('Index: Navigation error:', error);
          // If navigation fails, just log it - don't try to retry as it might cause more issues
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, router, showSplash]);

  // Auto-proceed after 5 seconds if button doesn't work
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showSplash) {
        console.log('🔥 Index: Auto-proceeding after 5 seconds (button fallback)');
        setShowSplash(false);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [showSplash]);

  // Show splash screen
  if (showSplash) {
    console.log('🔥 Index: Rendering splash screen with button');
    return (
      <View style={styles.splashContainer}>
        <Text style={styles.title}>QuickFix</Text>
        <Text style={styles.subtitle}>Smart Repair Service System</Text>
        <Text style={styles.description}>
          Connect with skilled technicians for fast, reliable repairs
          {'\n\n'}(Auto-proceeding in 5 seconds...)
        </Text>
        
        <Pressable 
          style={[styles.button]} 
          onPress={handleGetStarted}
          onPointerDown={() => console.log('🔥 Index: Button pointer down!')}
          onPressIn={() => console.log('🔥 Index: Button press in!')}
          onPressOut={() => console.log('🔥 Index: Button press out!')}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Get Started"
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
        
        {/* Web-specific button as fallback */}
        <div 
          style={{
            backgroundColor: '#fff',
            padding: '15px 30px',
            borderRadius: '25px',
            cursor: 'pointer',
            marginTop: '20px',
            border: 'none',
            fontSize: '18px',
            fontWeight: '600',
            color: '#0d6efd',
            userSelect: 'none',
            textAlign: 'center',
            transition: 'all 0.2s ease'
          }}
          onClick={() => {
            console.log('🔥 Index: HTML div clicked!');
            handleGetStarted();
          }}
          onMouseDown={() => console.log('🔥 Index: HTML div mouse down!')}
          onMouseUp={() => console.log('🔥 Index: HTML div mouse up!')}
        >
          Get Started (HTML)
        </div>
      </View>
    );
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0096FF" />
        <Text style={styles.loadingText}>Loading QuickFix...</Text>
      </View>
    );
  }

  // Show redirecting message
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0096FF" />
      <Text style={styles.loadingText}>Redirecting...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#0d6efd',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.9,
  },
  button: {
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    cursor: 'pointer',
  },
  buttonPressed: {
    backgroundColor: '#f0f0f0',
    transform: [{ scale: 0.95 }],
  },
  buttonText: {
    color: '#0d6efd',
    fontSize: 18,
    fontWeight: '600',
  },
});
