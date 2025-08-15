// Firestore Security Rules for Error Codes
// Copy these rules to your Firebase Console -> Firestore Database -> Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin (hardcoded)
    function isHardcodedAdmin() {
      return request.auth != null && 
             (request.auth.token.email == 'valenarbert@gmail.com' ||
              request.auth.token.email == 'admin@calculadoraelectrica.com' ||
              request.auth.token.email == 'valentin@admin.com' ||
              request.auth.token.email == 'admin@example.com');
    }

    // Helper function to check if user is admin in Firebase
    function isFirebaseAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/admins/$(request.auth.token.email.replace('[^a-z0-9]', '_'))) &&
             get(/databases/$(database)/documents/admins/$(request.auth.token.email.replace('[^a-z0-9]', '_'))).data.isActive == true;
    }

    // Combined admin check
    function isAdmin() {
      return isHardcodedAdmin() || isFirebaseAdmin();
    }

    // Manufacturers collection - read for all authenticated users, write for admins only
    match /manufacturers/{manufacturerId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
      
      // Lines subcollection
      match /lines/{lineId} {
        allow read: if request.auth != null;
        allow write: if isAdmin();
        
        // Error codes subcollection for lines without sublines
        match /errorCodes/{errorCodeId} {
          allow read: if request.auth != null;
          allow write: if isAdmin();
        }
        
        // SubLines subcollection
        match /subLines/{subLineId} {
          allow read: if request.auth != null;
          allow write: if isAdmin();
          
          // Error codes subcollection for sublines
          match /errorCodes/{errorCodeId} {
            allow read: if request.auth != null;
            allow write: if isAdmin();
          }
        }
      }
    }
    
    // Product codes collection - read for all authenticated users, write for admins only
    match /productCodes/{productCode} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    // Administrators collection - read for admins, write for hardcoded admins only
    match /admins/{adminId} {
      allow read: if isAdmin();
      allow write: if isHardcodedAdmin();
    }

    // Admin invitations collection - read and write for admins only
    match /adminInvitations/{invitationId} {
      allow read, write: if isAdmin();
    }

    // Notifications collection - read for admins, write for admins only
    match /notifications/{notificationId} {
      // Admins can read all notifications (recipientEmail = null) or their own notifications
      allow read: if isAdmin() && 
        (resource.data.recipientEmail == null || 
         resource.data.recipientEmail == request.auth.token.email);
      
      // Only admins can create, update, and delete notifications
      allow write: if isAdmin();
    }
    
    // Projects collection (existing rules)
    match /projects/{projectId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.ownerId || 
         request.auth.token.email in resource.data.collaborators);
    }
  }
}

// Instructions:
// 1. Go to Firebase Console
// 2. Navigate to Firestore Database
// 3. Go to Rules tab
// 4. Replace existing rules with the rules above
// 5. Publish the rules

// Collections Security Summary:
// - manufacturers/*: Read (authenticated), Write (admins only)
// - productCodes/*: Read (authenticated), Write (admins only) 
// - admins/*: Read (admins), Write (hardcoded admins only)
// - adminInvitations/*: Read/Write (admins only)
// - notifications/*: Read (admins, own notifications), Write (admins only)
// - projects/*: Read/Write (owner + collaborators)

// Admin Emails Configuration:
// Hardcoded admin emails (can invite others):
// - valenarbert@gmail.com (Main admin)
// - admin@calculadoraelectrica.com
// - valentin@admin.com
// - admin@example.com
//
// Firebase-based admins are stored in the 'admins' collection
// and can be managed through the invite system
//
// Notifications System:
// - Admins receive notifications for all admin activities
// - Notifications auto-expire after 30 days
// - Real-time updates via Firestore listeners