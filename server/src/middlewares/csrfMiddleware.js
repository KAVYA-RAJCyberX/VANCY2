const csrfProtection = (req, res, next) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Ensure origin or referer is present and trusted
  const origin = req.headers.origin || req.headers.referer;
  
  if (!origin) {
    // Legitimate non-browser clients (e.g., cURL, mobile) might not send Origin/Referer.
    // However, modern browsers ALWAYS send Origin on cross-origin POSTs.
    return next();
  }

  const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,
    'http://localhost:5173',
    'http://localhost:5175',
    'http://localhost:3000'
  ].filter(Boolean);

  let isAllowed = false;
  if (
    origin.startsWith('http://localhost:') || 
    origin.startsWith('http://127.0.0.1:') ||
    origin.startsWith('http://192.168.') ||
    origin.startsWith('http://10.') ||
    origin.startsWith('capacitor://')
  ) {
    isAllowed = true;
  } else {
    isAllowed = allowedOrigins.some(allowed => origin === allowed || origin.startsWith(allowed + '/'));
  }

  if (!isAllowed) {
    return res.status(403).json({ message: 'CSRF violation: Invalid Origin' });
  }

  next();
};

module.exports = { csrfProtection };
