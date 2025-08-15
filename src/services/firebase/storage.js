import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

export const storageService = {
  // Upload profile photo
  async uploadProfilePhoto(userId, file) {
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `profile_${timestamp}.${fileExtension}`;
      
      // Create a reference to the file location
      const photoRef = ref(storage, `profile-photos/${userId}/${fileName}`);
      
      // Upload the file
      const snapshot = await uploadBytes(photoRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw new Error('Error al subir la imagen: ' + error.message);
    }
  },

  // Delete profile photo
  async deleteProfilePhoto(photoURL) {
    try {
      if (!photoURL || !photoURL.includes('firebase')) {
        return; // Not a Firebase Storage URL
      }
      
      // Create a reference from the URL
      const photoRef = ref(storage, photoURL);
      
      // Delete the file
      await deleteObject(photoRef);
    } catch (error) {
      console.error('Error deleting profile photo:', error);
      // Don't throw error for deletion failures, just log
    }
  },

  // Get file size in MB
  getFileSizeInMB(file) {
    return file.size / (1024 * 1024);
  },

  // Validate file type
  isValidImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  }
};