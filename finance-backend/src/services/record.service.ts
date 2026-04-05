import { Prisma, PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { CreateRecordInput, UpdateRecordInput, RecordFilterInput, RecordType } from '../validators/record.validator';

const prisma = new PrismaClient();

export const createRecord = async (data: CreateRecordInput, userId: string) => {
  return await prisma.financialRecord.create({
    data: {
      ...data,
      userId,
    },
  });
};

export const getRecords = async (filters: RecordFilterInput) => {
  const { type, category, search, startDate, endDate, page, limit } = filters;

  const where: Prisma.FinancialRecordWhereInput = {
    deletedAt: null, // Exclude soft deleted
  };

  if (type) where.type = type;
  if (category) {
    where.category = { contains: category, mode: 'insensitive' };
  }
  if (search) {
    where.OR = [
      { category: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = startDate;
    if (endDate) where.date.lte = endDate;
  }

  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    prisma.financialRecord.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limit,
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.financialRecord.count({ where }),
  ]);

  return {
    records,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const getRecordById = async (id: string) => {
  const record = await prisma.financialRecord.findFirst({
    where: { id, deletedAt: null },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  if (!record) {
    throw new AppError('Record not found', 404);
  }

  return record;
};

export const updateRecord = async (id: string, data: UpdateRecordInput) => {
  const existingRecord = await prisma.financialRecord.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existingRecord) {
    throw new AppError('Record not found', 404);
  }

  return await prisma.financialRecord.update({
    where: { id },
    data,
  });
};

export const softDeleteRecord = async (id: string) => {
  const existingRecord = await prisma.financialRecord.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existingRecord) {
    throw new AppError('Record not found', 404);
  }

  return await prisma.financialRecord.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

export const getRecordStats = async () => {
  const records = await prisma.financialRecord.findMany({
    where: { deletedAt: null },
    select: { amount: true, type: true },
  });

  let totalIncome = 0;
  let totalExpenses = 0;

  for (const record of records) {
    if (record.type === RecordType.INCOME) {
      totalIncome += record.amount;
    } else if (record.type === RecordType.EXPENSE) {
      totalExpenses += record.amount;
    }
  }

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
  };
};
