import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/authService';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user
    });
  } catch (error: any) {
    if (error.message === 'E-mail já está em uso.') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await loginUser(req.body);
    res.json({
      message: 'Login bem-sucedido',
      token: result.token,
      user: result.user
    });
  } catch (error: any) {
    if (error.message === 'Credenciais inválidas.') {
      return res.status(401).json({ error: error.message });
    }
    next(error);
  }
};
