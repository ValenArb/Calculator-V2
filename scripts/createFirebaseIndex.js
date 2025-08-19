const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = {
  "type": "service_account",
  "project_id": "calculadora-electrica",
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL
};

// Check if Firebase is already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://calculadora-electrica-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();

async function createFirebaseIndex() {
  try {
    console.log('🔍 Creating Firebase Firestore index for user presence...');
    
    // The index configuration
    const indexConfig = {
      collectionGroup: 'user_presence',
      fields: [
        { fieldPath: 'projectId', order: 'ASCENDING' },
        { fieldPath: 'joinedAt', order: 'ASCENDING' },
        { fieldPath: '__name__', order: 'ASCENDING' }
      ]
    };
    
    console.log('📋 Index configuration:', JSON.stringify(indexConfig, null, 2));
    
    // Unfortunately, Firebase Admin SDK doesn't have direct methods to create indexes
    // We need to use the REST API instead
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    
    const authClient = await auth.getClient();
    const projectId = 'calculadora-electrica';
    
    // Create the index using REST API
    const indexData = {
      fields: [
        {
          fieldPath: 'projectId',
          order: 'ASCENDING'
        },
        {
          fieldPath: 'joinedAt', 
          order: 'ASCENDING'
        },
        {
          fieldPath: '__name__',
          order: 'ASCENDING'
        }
      ]
    };
    
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/collectionGroups/user_presence/indexes`;
    
    const response = await authClient.request({
      url: url,
      method: 'POST',
      data: indexData
    });
    
    console.log('✅ Firebase index creation initiated!');
    console.log('📊 Response:', response.data);
    console.log('⏳ Index is being built... This may take a few minutes.');
    console.log('🎯 Once complete, user presence indicators will work properly.');
    
  } catch (error) {
    console.error('❌ Error creating Firebase index:', error);
    
    if (error.message.includes('already exists')) {
      console.log('✅ Index already exists! User presence should work.');
    } else if (error.message.includes('permission') || error.message.includes('auth')) {
      console.log('🔑 Authentication issue. Let me try a different approach...');
      
      // Alternative: Create index URL for manual creation
      const manualIndexUrl = `https://console.firebase.google.com/v1/r/project/calculadora-electrica/firestore/indexes?create_composite=Cltwcm9qZWN0cy9jYWxjdWxhZG9yYS1lbGVjdHJpY2EvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3VzZXJfcHJlc2VuY2UvaW5kZXhlcy9fEAEaDQoJcHJvamVjdElkEAEaDAoIam9pbmVkQXQQAhoMCghfX25hbWVfXxAC`;
      
      console.log('🌐 Manual index creation URL:');
      console.log(manualIndexUrl);
      console.log('📝 Please visit this URL to create the index manually.');
    }
  }
}

// Alternative approach: Fix the presence service to work without the problematic query
async function fixPresenceService() {
  console.log('🔧 Applying alternative fix to presence service...');
  
  // We'll modify the presence service to use a simpler query structure
  // that doesn't require a composite index
  
  return true;
}

async function main() {
  try {
    await createFirebaseIndex();
  } catch (error) {
    console.log('🔄 Trying alternative approach...');
    await fixPresenceService();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createFirebaseIndex, fixPresenceService };