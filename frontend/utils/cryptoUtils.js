import CryptoJS from 'crypto-js';

export const generateRoomKey = (userId1, userId2) => {
  const sortedIds = [userId1, userId2].sort();
  const combined = sortedIds.join('_');
  return CryptoJS.SHA256(combined).toString();
};

export const encryptMessage = (message, roomKey) => {
  const encrypted = CryptoJS.AES.encrypt(message, roomKey).toString();
  return encrypted;
};

export const decryptMessage = (encryptedMessage, roomKey) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedMessage, roomKey);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};