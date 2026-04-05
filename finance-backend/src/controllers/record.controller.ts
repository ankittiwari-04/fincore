import { Request, Response } from 'express';
import * as recordService from '../services/record.service';
import { createRecordSchema, updateRecordSchema, recordFilterSchema } from '../validators/record.validator';

export const createRecord = async (req: Request, res: Response) => {
  const data = createRecordSchema.parse(req.body);
  const record = await recordService.createRecord(data, req.user!.id);
  res.status(201).json({
    status: 'success',
    data: { record },
  });
};

export const getRecords = async (req: Request, res: Response) => {
  const filters = recordFilterSchema.parse(req.query);
  const result = await recordService.getRecords(filters);
  res.status(200).json({
    status: 'success',
    data: result,
  });
};

export const getRecordById = async (req: Request, res: Response) => {
  const record = await recordService.getRecordById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: { record },
  });
};

export const updateRecord = async (req: Request, res: Response) => {
  const data = updateRecordSchema.parse(req.body);
  const record = await recordService.updateRecord(req.params.id, data);
  res.status(200).json({
    status: 'success',
    data: { record },
  });
};

export const deleteRecord = async (req: Request, res: Response) => {
  await recordService.softDeleteRecord(req.params.id);
  res.status(204).send();
};
