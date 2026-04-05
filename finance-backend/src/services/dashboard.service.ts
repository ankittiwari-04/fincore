import { PrismaClient } from '@prisma/client';
import { RecordType } from '../validators/record.validator';

const prisma = new PrismaClient();

export const getSummary = async () => {
  const records = await prisma.financialRecord.findMany({
    where: { deletedAt: null },
    select: { amount: true, type: true },
  });

  let totalIncome = 0;
  let totalExpenses = 0;

  for (const r of records) {
    if (r.type === RecordType.INCOME) totalIncome += r.amount;
    else if (r.type === RecordType.EXPENSE) totalExpenses += r.amount;
  }

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    totalRecords: records.length,
  };
};

export const getCategoryBreakdown = async () => {
  const records = await prisma.financialRecord.groupBy({
    by: ['category', 'type'],
    where: { deletedAt: null },
    _sum: { amount: true },
    _count: { id: true },
  });

  return records.map((r) => ({
    category: r.category,
    type: r.type,
    total: r._sum.amount || 0,
    count: r._count.id,
  }));
};

function startOfWeekMonday(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function weekKey(d: Date): string {
  return startOfWeekMonday(d).toISOString().slice(0, 10);
}

export const getMonthlyTrends = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const records = await prisma.financialRecord.findMany({
    where: {
      deletedAt: null,
      date: { gte: sixMonthsAgo },
    },
    select: { date: true, amount: true, type: true },
  });

  const monthMap: Record<
    string,
    { month: string; label: string; income: number; expenses: number; net: number }
  > = {};

  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' });

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = formatter.format(d);
    monthMap[key] = { month: key, label: key, income: 0, expenses: 0, net: 0 };
  }

  for (const r of records) {
    const key = formatter.format(r.date);
    if (monthMap[key]) {
      if (r.type === RecordType.INCOME) monthMap[key].income += r.amount;
      else if (r.type === RecordType.EXPENSE) monthMap[key].expenses += r.amount;
    }
  }

  const result = Object.values(monthMap).map(m => ({
    ...m,
    net: m.income - m.expenses,
  }));

  return result;
};

export const getWeeklyTrends = async () => {
  const weekCount = 8;
  const now = new Date();
  const currentWeekStart = startOfWeekMonday(now);
  const weekMap: Record<
    string,
    { weekOf: string; label: string; income: number; expenses: number; net: number }
  > = {};
  const labelFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  for (let i = weekCount - 1; i >= 0; i--) {
    const w = new Date(currentWeekStart);
    w.setDate(w.getDate() - i * 7);
    const key = weekKey(w);
    weekMap[key] = {
      weekOf: key,
      label: `Week of ${labelFormatter.format(w)}`,
      income: 0,
      expenses: 0,
      net: 0,
    };
  }

  const oldestWeekStart = new Date(currentWeekStart);
  oldestWeekStart.setDate(oldestWeekStart.getDate() - (weekCount - 1) * 7);
  oldestWeekStart.setHours(0, 0, 0, 0);

  const records = await prisma.financialRecord.findMany({
    where: {
      deletedAt: null,
      date: { gte: oldestWeekStart },
    },
    select: { date: true, amount: true, type: true },
  });

  for (const r of records) {
    const key = weekKey(r.date);
    if (weekMap[key]) {
      if (r.type === RecordType.INCOME) weekMap[key].income += r.amount;
      else if (r.type === RecordType.EXPENSE) weekMap[key].expenses += r.amount;
    }
  }

  return Object.values(weekMap).map((m) => ({
    ...m,
    net: m.income - m.expenses,
  }));
};

export const getTrends = async (period: 'month' | 'week') => {
  if (period === 'week') {
    return getWeeklyTrends();
  }
  return getMonthlyTrends();
};

export const getRecentActivity = async () => {
  return await prisma.financialRecord.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      user: { select: { name: true, email: true } },
    },
  });
};
