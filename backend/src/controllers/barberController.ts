import { Request, Response, NextFunction } from 'express';
import { listBarbers, getBarberById, insertBarber, removeBarber, editBarber } from '../services/barberService';

export const getBarbers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const barbers = await listBarbers();
    res.json(barbers);
  } catch (error) {
    next(error);
  }
};

export const getBarber = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const barber = await getBarberById(req.params.id as string);
    if (!barber) return res.status(404).json({ error: 'Barbeiro não encontrado' });
    res.json(barber);
  } catch (error) {
    next(error);
  }
};

export const createBarber = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const barber = await insertBarber(req.body);
    res.status(201).json(barber);
  } catch (error) {
    next(error);
  }
};

export const deleteBarber = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await removeBarber(req.params.id as string);
    res.json({ message: 'Barbeiro deletado' });
  } catch (error) {
    next(error);
  }
};

export const updateBarber = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const barber = await editBarber(req.params.id as string, req.body);
    res.json(barber);
  } catch (error) {
    next(error);
  }
};
