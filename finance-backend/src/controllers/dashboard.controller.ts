import { Request, Response } from 'express';
import * as dashboardService from '../services/dashboard.service';
import { trendsQuerySchema } from '../validators/dashboard.validator';

export const getSummary = async (req: Request, res: Response) => {
  const summary = await dashboardService.getSummary();
  res.status(200).json({ status: 'success', data: summary });
};

export const getCategoryBreakdown = async (req: Request, res: Response) => {
  const breakdown = await dashboardService.getCategoryBreakdown();
  res.status(200).json({ status: 'success', data: breakdown });
};

export const getTrends = async (req: Request, res: Response) => {
  const { period } = trendsQuerySchema.parse(req.query);
  const trends = await dashboardService.getTrends(period);
  res.status(200).json({ status: 'success', data: { period, trends } });
};

export const getRecentActivity = async (req: Request, res: Response) => {
  const activity = await dashboardService.getRecentActivity();
  res.status(200).json({ status: 'success', data: activity });
};
