// Authentication Middleware
// Verifies Firebase ID tokens and maps to local user

const { admin } = require('../config/firebase-admin');
const db = require('../config/database');

async function verifyFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    req.firebaseUid = decodedToken.uid;
    req.email = decodedToken.email;
    
    // Get or create user in local database
    const connection = await db.getConnection();
    try {
      const [users] = await connection.query(
        'SELECT id FROM users WHERE firebase_uid = ?',
        [req.firebaseUid]
      );
      
      if (users.length === 0) {
        // First time user - create record
        const [result] = await connection.query(
          'INSERT INTO users (firebase_uid, email) VALUES (?, ?)',
          [req.firebaseUid, req.email]
        );
        req.userId = result.insertId;
      } else {
        req.userId = users[0].id;
      }
      
      next();
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Auth error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { verifyFirebaseToken };
