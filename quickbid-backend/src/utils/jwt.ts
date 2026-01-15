import jwt, { SignOptions, Secret } from 'jsonwebtoken';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'quickbid-dev-secret';
const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || '2h';

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not set; falling back to development secret');
}

interface JwtPayload {
  sub: string;
  role: string;
  [key: string]: unknown;
}

export const signToken = (payload: JwtPayload, options?: SignOptions) => {
  const signOptions: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as any,
    ...(options ?? {}),
  };
  return jwt.sign(payload, JWT_SECRET, signOptions);
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
