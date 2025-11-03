/**
 * Greeting and Quote Utility
 * Provides time-based greetings and role-specific motivational quotes
 */

export interface User {
  firstName?: string;
  role?: 'client' | 'technician' | 'admin';
  createdAt?: string | Date;
}

export interface GreetingResult {
  greeting: string;
  quote: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

/**
 * Get time-based greeting and role-specific quote
 */
export const getGreeting = (user: User | null): GreetingResult => {
  const hour = new Date().getHours();
  const firstName = user?.firstName || 'User';
  
  // Check if user is new (created within last 5 minutes)
  if (user?.createdAt) {
    const createdAt = new Date(user.createdAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    
    if (diffMinutes < 5) {
      return {
        greeting: `Welcome to QuickFix, ${firstName}!`,
        quote: getNewUserQuote(user.role),
        timeOfDay: getTimeOfDay(hour)
      };
    }
  }
  
  // Time-based greeting
  let greeting = '';
  if (hour >= 0 && hour < 12) {
    greeting = `Good Morning, ${firstName}`;
  } else if (hour >= 12 && hour < 16) {
    greeting = `Good Afternoon, ${firstName}`;
  } else if (hour >= 16 && hour < 22) {
    greeting = `Good Evening, ${firstName}`;
  } else {
    greeting = `Good Night, ${firstName}`;
  }
  
  return {
    greeting,
    quote: getRoleQuote(user?.role, hour),
    timeOfDay: getTimeOfDay(hour)
  };
};

/**
 * Get time of day classification
 */
const getTimeOfDay = (hour: number): 'morning' | 'afternoon' | 'evening' | 'night' => {
  if (hour >= 0 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 16) return 'afternoon';
  if (hour >= 16 && hour < 22) return 'evening';
  return 'night';
};

/**
 * Get welcome quote for new users
 */
const getNewUserQuote = (role?: string): string => {
  const quotes: Record<string, string> = {
    client: "Let's find the perfect technician for your needs",
    technician: "Welcome to the QuickFix technician community - let's grow your business!",
    admin: "Welcome to QuickFix Admin Dashboard - manage and empower!"
  };
  return quotes[role || 'client'] || quotes.client;
};

/**
 * Get role and time-appropriate quote
 */
const getRoleQuote = (role?: string, hour?: number): string => {
  const currentHour = hour ?? new Date().getHours();
  
  const clientQuotes = [
    "Find trusted technicians for all your repair needs",
    "Quality service, delivered fast",
    "Your satisfaction is our priority"
  ];
  
  const technicianQuotes = [
    "Help customers and grow your business today",
    "New opportunities are waiting for you",
    "Build your reputation, one job at a time"
  ];
  
  const adminQuotes = [
    "Monitor and optimize QuickFix operations",
    "Keep QuickFix running smoothly",
    "Empowering technicians, delighting clients"
  ];
  
  let quotes = clientQuotes;
  if (role === 'technician') quotes = technicianQuotes;
  else if (role === 'admin') quotes = adminQuotes;
  
  // Rotate quote based on time of day (morning/afternoon/evening-night)
  const quoteIndex = Math.floor(currentHour / 8) % quotes.length;
  return quotes[quoteIndex];
};

/**
 * Get quick motivational snippet based on time
 */
export const getMotivation = (role?: string): string => {
  const hour = new Date().getHours();
  
  if (role === 'technician') {
    if (hour >= 6 && hour < 12) return "Start your day strong!";
    if (hour >= 12 && hour < 18) return "Keep up the great work!";
    return "Almost done for the day!";
  }
  
  if (hour >= 6 && hour < 12) return "Great day to fix things!";
  if (hour >= 12 && hour < 18) return "Quick fixes, done right!";
  return "We're here when you need us!";
};
