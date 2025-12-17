const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../model/user');
const OAuthIdentity = require('../model/oauthIdentity');
const CustomError = require('../../common/utils/customError');
const { verifyGoogleIdToken } = require('../service/googleTokenVerifier');

function issueTokensAndSetCookie(res, foundUser) {
  const accessToken = jwt.sign(
    { UserInfo: { id: foundUser.id, email: foundUser.email } },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { email: foundUser.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '1d' }
  );

  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    sameSite: 'None',
    // secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  return { accessToken, refreshToken };
}

async function findOrCreateUserByOAuth({ provider, sub, email, name }) {
  const existingIdentity = await OAuthIdentity.findByProviderAndUserId(provider, sub);
  if (existingIdentity) {
    const user = await User.findById(existingIdentity.user_id);
    if (!user) throw new CustomError('User linked to identity not found.', 500);
    return user;
  }

  if (!email) throw new CustomError('Email was not provided by provider. Cannot create user.', 400);

  let user = await User.findOneByEmail(email);
  if (!user) {
    const randomPwd = `${provider}:${sub}:${Date.now()}`;
    const password_hash = await bcrypt.hash(randomPwd, 10);
    const safeName = name || email.split('@')[0];

    user = await User.create({ email, name: safeName, password_hash });
  }

  await OAuthIdentity.create({
    user_id: user.id,
    provider,
    provider_user_id: sub,
    email,
  });

  return user;
}

const handleGoogleOAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    const payload = await verifyGoogleIdToken(idToken);

    const sub = payload.sub;
    const email = payload.email;
    const name = payload.name;

    const user = await findOrCreateUserByOAuth({ provider: 'google', sub, email, name });

    const { accessToken, refreshToken } = issueTokensAndSetCookie(res, user);
    await User.updateRefreshToken(user.id, refreshToken);

    return res.json({ accessToken });
  } catch (err) {
    return next(err);
  }
};

const handleAppleOAuth = async (req, res, next) => {
  try {
    throw new CustomError('Apple Sign-In backend verification requires JWKS verification (jose). Not enabled due to npm registry restrictions.', 501);
  } catch (err) {
    return next(err);
  }
};

module.exports = { handleGoogleOAuth, handleAppleOAuth };