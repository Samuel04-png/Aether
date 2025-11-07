import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export interface DashboardKpi {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
}

export interface DashboardSalesItem {
  id: string;
  month: string;
  sales: number;
}

interface DashboardState {
  kpis: DashboardKpi[];
  monthlySales: DashboardSalesItem[];
}

const defaultDashboardState: DashboardState = {
  kpis: [],
  monthlySales: [],
};

export const useDashboard = (userId?: string) => {
  const [data, setData] = useState<DashboardState>(defaultDashboardState);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setData(defaultDashboardState);
      setLoading(false);
      return;
    }

    const dashboardDoc = doc(db, 'users', userId, 'dashboard', 'overview');
    const unsubscribe = onSnapshot(
      dashboardDoc,
      (snapshot) => {
        const payload = snapshot.data() as DashboardState | undefined;
        setData({
          kpis: payload?.kpis ?? [],
          monthlySales: payload?.monthlySales ?? [],
        });
        setLoading(false);
        setError(null);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  const uploadDashboardData = async (
    type: 'kpi' | 'sales',
    payload: Omit<DashboardKpi, 'id'> | Omit<DashboardSalesItem, 'id'>
  ) => {
    if (!userId) throw new Error('User ID is required to upload data.');

    const dashboardDoc = doc(db, 'users', userId, 'dashboard', 'overview');
    const newId = `${type}-${Date.now()}`;

    if (type === 'kpi') {
      const newKpi: DashboardKpi = { id: newId, ...(payload as Omit<DashboardKpi, 'id'>) };
      await setDoc(dashboardDoc, { kpis: [...data.kpis, newKpi], monthlySales: data.monthlySales }, { merge: true });
    } else {
      const newSales: DashboardSalesItem = { id: newId, ...(payload as Omit<DashboardSalesItem, 'id'>) };
      await setDoc(dashboardDoc, { kpis: data.kpis, monthlySales: [...data.monthlySales, newSales] }, { merge: true });
    }
  };

  return {
    ...data,
    loading,
    error,
    uploadDashboardData,
  };
};

