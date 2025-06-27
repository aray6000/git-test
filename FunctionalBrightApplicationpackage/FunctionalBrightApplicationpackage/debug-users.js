
// Debug script to check user data
// Run this in the browser console to see all registered users

function debugUsers() {
  console.log('=== DEBUGGING USER DATA ===');
  
  // Check main database
  const userDb = localStorage.getItem('crazy-paste-user-database');
  if (userDb) {
    const parsed = JSON.parse(userDb);
    console.log('Main database found with', parsed.users?.length || 0, 'users');
    console.log('Database structure:', parsed);
    
    if (parsed.users && parsed.users.length > 0) {
      console.log('\n--- USER DETAILS ---');
      parsed.users.forEach((user, index) => {
        console.log(`User ${index + 1}:`);
        console.log('  Email:', user.email);
        console.log('  Username:', user.username);
        console.log('  Password:', user.password);
        console.log('  Active:', user.isActive);
        console.log('  Guest:', user.isGuest);
        console.log('  Role:', user.role);
        console.log('  Created:', user.createdAt);
        console.log('  ---');
      });
    }
  } else {
    console.log('No main database found');
  }
  
  // Check legacy users
  const legacyUsers = localStorage.getItem('crazy-paste-users');
  if (legacyUsers) {
    const parsed = JSON.parse(legacyUsers);
    console.log('\nLegacy users found:', parsed.length);
    console.log('Legacy users:', parsed);
  } else {
    console.log('No legacy users found');
  }
  
  // Check current user
  const currentUser = localStorage.getItem('crazy-paste-current-user');
  if (currentUser) {
    const parsed = JSON.parse(currentUser);
    console.log('\nCurrent user:', parsed);
  } else {
    console.log('No current user found');
  }
  
  console.log('=== END DEBUG ===');
}

// Add a function to test login
function testLogin(email, password) {
  console.log('=== TESTING LOGIN ===');
  console.log('Email:', email);
  console.log('Password:', password);
  
  // Import the login function (this assumes the auth module is available)
  if (typeof window !== 'undefined' && window.loginUser) {
    const result = window.loginUser(email, password);
    console.log('Login result:', result);
  } else {
    console.log('Login function not available - run this on the auth page');
  }
  
  console.log('=== END TEST ===');
}

// Run the debug function
debugUsers();

// Make functions available globally for easy testing
window.debugUsers = debugUsers;
window.testLogin = testLogin;

console.log('Debug functions loaded. You can run:');
console.log('- debugUsers() to see all user data');
console.log('- testLogin("email", "password") to test login');
