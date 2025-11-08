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

const DASHBOARD_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

type DashboardCacheEntry = {
  data: DashboardState;
  timestamp: number;
};

const dashboardCache = new Map<string, DashboardCacheEntry>();

const areDashboardStatesEqual = (a: DashboardState, b: DashboardState): boolean => {
  if (a.kpis.length !== b.kpis.length || a.monthlySales.length !== b.monthlySales.length) {
    return false;
  }
  for (let i = 0; i < a.kpis.length; i++) {
    const aKpi = a.kpis[i];
    const bKpi = b.kpis[i];
    if (
      aKpi.id !== bKpi.id ||
      aKpi.title !== bKpi.title ||
      aKpi.value !== bKpi.value ||
      aKpi.change !== bKpi.change ||
      aKpi.changeType !== bKpi.changeType
    ) {
      return false;
    }
  }
  for (let i = 0; i < a.monthlySales.length; i++) {
    const aSale = a.monthlySales[i];
    const bSale = b.monthlySales[i];
    if (
      aSale.id !== bSale.id ||
      aSale.month !== bSale.month ||
      aSale.sales !== bSale.sales
    ) {
      return false;
    }
  }
  return true;
};

export const useDashboard = (userId?: string) => {
  const [data, setData] = useState<DashboardState>(defaultDashboardState);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<string | null>(null);
  const cacheKey = userId ? `dashboard:${userId}` : null;

  useEffect(() => {
    if (!userId || !cacheKey) {
      setData(defaultDashboardState);
      setLoading(false);
      return;
    }

    const cached = dashboardCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < DASHBOARD_CACHE_TTL) {
      setData(cached.data);
      setLoading(false);
    }

    const dashboardDoc = doc(db, 'users', userId, 'dashboard', 'overview');
    const unsubscribe = onSnapshot(
      dashboardDoc,
      (snapshot) => {
        const payload = snapshot.data() as DashboardState | undefined;
        const nextData: DashboardState = {
          kpis: payload?.kpis ?? [],
          monthlySales: payload?.monthlySales ?? [],
        };
        const current = dashboardCache.get(cacheKey)?.data ?? defaultDashboardState;
        if (!areDashboardStatesEqual(current, nextData)) {
          dashboardCache.set(cacheKey, { data: nextData, timestamp: Date.now() });
          setData(nextData);
        }
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
    if (!cacheKey) return;

    const dashboardDoc = doc(db, 'users', userId, 'dashboard', 'overview');
    const newId = `${type}-${Date.now()}`;

    let optimisticState: DashboardState | null = null;
    const commitLocalUpdate = (updater: (previous: DashboardState) => DashboardState) => {
      setData((prev) => {
        const nextState = updater(prev);
        dashboardCache.set(cacheKey, { data: nextState, timestamp: Date.now() });
        optimisticState = nextState;
        return nextState;
      });
    };

    if (type === 'kpi') {
      const newKpi: DashboardKpi = { id: newId, ...(payload as Omit<DashboardKpi, 'id'>) };
      commitLocalUpdate((prev) => {
        const nextKpis = [...prev.kpis, newKpi];
        return {
          kpis: nextKpis,
          monthlySales: prev.monthlySales,
        };
      });
      const stateToPersist = optimisticState ?? dashboardCache.get(cacheKey)?.data ?? defaultDashboardState;
      await setDoc(
        dashboardDoc,
        { kpis: stateToPersist.kpis, monthlySales: stateToPersist.monthlySales },
        { merge: true },
      );
    } else {
      const newSales: DashboardSalesItem = { id: newId, ...(payload as Omit<DashboardSalesItem, 'id'>) };
      commitLocalUpdate((prev) => {
        const nextSales = [...prev.monthlySales, newSales];
        return {
          kpis: prev.kpis,
          monthlySales: nextSales,
        };
      });
      const stateToPersist = optimisticState ?? dashboardCache.get(cacheKey)?.data ?? defaultDashboardState;
      await setDoc(
        dashboardDoc,
        { kpis: stateToPersist.kpis, monthlySales: stateToPersist.monthlySales },
        { merge: true },
      );
    }
  };

  return {
    ...data,
    loading,
    error,
    uploadDashboardData,
  };
};

