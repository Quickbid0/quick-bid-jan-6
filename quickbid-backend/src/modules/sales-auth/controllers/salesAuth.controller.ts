import { Request, Response } from 'express';
import { loginSalesUser, findSalesUserById } from '../services/salesAuth.service';
import { verifyToken } from '../../../utils/jwt';

export const handleSalesLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const loginResult = await loginSalesUser(email, password);
    return res.status(200).json(loginResult);
  } catch (err) {
    console.error('sales login error', err);
    return res.status(401).json({ message: (err as Error).message || 'Invalid credentials' });
  }
};

export const handleSalesLogout = (_req: Request, res: Response) => {
  return res.status(200).json({ message: 'Logout successful. Discard token client-side.' });
};

export const handleSalesMe = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing authorization header' });
  }

  try {
    const token = authHeader.substring('Bearer '.length);
    const payload = verifyToken(token);
    const user = await findSalesUserById(payload.sub);

    if (!user) {
      return res.status(404).json({ message: 'Sales user not found' });
    }

    const { password_hash, ...rest } = user;
    return res.status(200).json({ user: rest });
  } catch (err) {
    console.error('sales me error', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
