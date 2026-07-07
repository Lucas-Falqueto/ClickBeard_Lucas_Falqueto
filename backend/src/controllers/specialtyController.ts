import { Request, Response, NextFunction } from 'express';
import { listSpecialties, insertSpecialty, removeSpecialty } from '../services/specialtyService';

export const getSpecialties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const specialties = await listSpecialties();
    res.json(specialties);
  } catch (error) {
    next(error);
  }
};

export const createSpecialty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const specialty = await insertSpecialty(req.body);
    res.status(201).json(specialty);
  } catch (error) {
    next(error);
  }
};

export const deleteSpecialty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await removeSpecialty(id);
    res.json({ message: 'Especialidade deletada' });
  } catch (error) {
    next(error);
  }
};
