async function verifyGoogleIdToken(idToken) {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
  
    const resp = await fetch(url);
    const data = await resp.json();
  
    if (!resp.ok) {
      const msg = data?.error_description || data?.error || 'Invalid Google token';
      const err = new Error(msg);
      err.statusCode = 401;
      throw err;
    }
    console.log("GOOGLE token aud:", data.aud);
    console.log("SERVER env GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
    // aud must match your Google client ID
    if (data.aud !== process.env.GOOGLE_CLIENT_ID) {
      const err = new Error('Invalid Google token audience.');
      err.statusCode = 401;
      throw err;
    }
  
    return data;
  }
  
  module.exports = { verifyGoogleIdToken };