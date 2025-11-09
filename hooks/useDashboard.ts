import { useCallback, useEffect, useRef, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const DASHBOARD_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

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

const getCacheKey = (userId: string) => `dashboard-cache-${userId}`;

const areDashboardStatesEqual = (a: DashboardState, b: DashboardState): boolean => {
  if (a === b) return true;
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

const readCachedDashboardState = (userId: string): DashboardState | null => {
  try {
    const cacheKey = getCacheKey(userId);
    const raw = sessionStorage.getItem(cacheKey);
    if (!raw) return null;
    const cached = JSON.parse(raw) as { timestamp: number; payload: DashboardState };
    if (Date.now() - cached.timestamp > DASHBOARD_CACHE_TTL) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }
    return cached.payload;
  } catch (error) {
    console.warn('Failed to parse dashboard cache', error);
    return null;
  }
};

const writeCachedDashboardState = (userId: string, state: DashboardState) => {
  try {
    const cacheKey = getCacheKey(userId);
    sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), payload: state }));
  } catch (error) {
    console.warn('Failed to cache dashboard data', error);
  }
};

export const useDashboard = (userId?: string) => {
  const [data, setData] = useState<DashboardState>(defaultDashboardState);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<string | null>(null);
  const currentStateRef = useRef<DashboardState>(defaultDashboardState);

  const applyStateUpdate = useCallback(
    (nextState: DashboardState, persist: boolean) => {
      if (areDashboardStatesEqual(currentStateRef.current, nextState)) {
        return;
      }
      currentStateRef.current = nextState;
      setData(nextState);
      if (persist && userId) {
        writeCachedDashboardState(userId, nextState);
      }
    },
    [userId],
  );

  useEffect(() => {
    if (!userId) {
      setData(defaultDashboardState);
      currentStateRef.current = defaultDashboardState;
      setLoading(false);
      return;
    }

    const cachedState = readCachedDashboardState(userId);
    if (cachedState) {
      currentStateRef.current = cachedState;
      setData(cachedState);
      setLoading(false);
    }

    const dashboardDoc = doc(db, 'users', userId, 'dashboard', 'overview');
    const unsubscribe = onSnapshot(
      dashboardDoc,
      (snapshot) => {
        const payload = snapshot.data() as DashboardState | undefined;
        const nextState = {
          kpis: payload?.kpis ?? [],
          monthlySales: payload?.monthlySales ?? [],
        };
        applyStateUpdate(nextState, true);
        setLoading(false);
        setError(null);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId, applyStateUpdate]);

  const uploadDashboardData = useCallback(
    async (
      type: 'kpi' | 'sales',
      payload: Omit<DashboardKpi, 'id'> | Omit<DashboardSalesItem, 'id'>
    ) => {
      if (!userId) throw new Error('User ID is required to upload data.');

      const dashboardDoc = doc(db, 'users', userId, 'dashboard', 'overview');
      const newId = `${type}-${Date.now()}`;
      const previousState = currentStateRef.current;

      try {
        if (type === 'kpi') {
          const newKpi: DashboardKpi = { id: newId, ...(payload as Omit<DashboardKpi, 'id'>) };
          applyStateUpdate(
            {
              kpis: [...previousState.kpis, newKpi],
              monthlySales: previousState.monthlySales,
            },
            true,
          );
          await setDoc(
            dashboardDoc,
            { kpis: [...previousState.kpis, newKpi], monthlySales: previousState.monthlySales },
            { merge: true },
          );
        } else {
          const newSales: DashboardSalesItem = { id: newId, ...(payload as Omit<DashboardSalesItem, 'id'>) };
          applyStateUpdate(
            {
              kpis: previousState.kpis,
              monthlySales: [...previousState.monthlySales, newSales],
            },
            true,
          );
          await setDoc(
            dashboardDoc,
            { kpis: previousState.kpis, monthlySales: [...previousState.monthlySales, newSales] },
            { merge: true },
          );
        }
      } catch (err) {
        applyStateUpdate(previousState, true);
        throw err;
      }
    },
    [userId, applyStateUpdate],
  );

  return {
    ...data,
    loading,
    error,
    uploadDashboardData,
  };
};

