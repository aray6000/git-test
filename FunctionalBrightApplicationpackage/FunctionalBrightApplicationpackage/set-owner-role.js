
// Script to set Sellerxd as Owner
const { setUserRoleByUsername } = require('./src/lib/auth.ts');

// Set @Sellerxd as Owner
const result = setUserRoleByUsername('@Sellerxd', 'Owner');

if (result) {
  console.log('✅ Successfully set Sellerxd as Owner');
} else {
  console.log('❌ Failed to set Sellerxd as Owner. User may not exist.');
}
