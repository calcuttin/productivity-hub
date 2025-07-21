// Script to generate VAPID keys for push notifications
// Run this script once to generate your VAPID keys, then add them to your .env file

const webpush = require('web-push');

console.log('Generating VAPID keys for push notifications...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('VAPID Keys Generated Successfully!\n');
console.log('Add these to your .env file:\n');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_EMAIL=your-email@example.com\n`);

console.log('Public Key (for client-side):');
console.log(vapidKeys.publicKey);
console.log('\nPrivate Key (keep secret):');
console.log(vapidKeys.privateKey); 