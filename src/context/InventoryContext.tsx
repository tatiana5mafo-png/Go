import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ITEM_CATALOG, ItemId } from '../constants/items';
import { supabase } from '../services/supabase';

export type Stock = Record<ItemId, number>;

interface Gain {
  item: ItemId;
  amount: number;
}

interface InventoryValue {
  stock: Stock;
  capacity: number;
  total: number;
  loading: boolean;
  refresh: () => Promise<void>;
  add: (gains: Gain[]) => void;
  consume: (id: ItemId) => void;
}

const CAPACITY = 100;

// Todos los ítems del catálogo en cero; lo que llegue del servidor se encima.
const EMPTY: Stock = ITEM_CATALOG.reduce((acc, i) => {
  acc[i.id] = 0;
  return acc;
}, {} as Stock);

const sum = (s: Stock) => Object.values(s).reduce((a, b) => a + b, 0);

const InventoryContext = createContext<InventoryValue | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [stock, setStock] = useState<Stock>(EMPTY);
  const [loading, setLoading] = useState(true);

  /** Lee el inventario real desde user_inventory (el RLS ya limita a las filas del usuario). */
  const refresh = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) return; // la sesión anónima aún no está lista; el listener de abajo vuelve a llamar

      const { data, error } = await supabase
        .from('user_inventory')
        .select('item_id, quantity')
        .eq('user_id', userId);
      if (error) throw error;

      const next: Stock = { ...EMPTY };
      (data ?? []).forEach((r: any) => {
        if (r.item_id in next) next[r.item_id as ItemId] = r.quantity;
      });
      setStock(next);
      setLoading(false);
    } catch (e) {
      console.warn('[inventory] no se pudo cargar:', e);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    // Si la sesión anónima se crea después de montar la app, cargamos en cuanto exista.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        // setTimeout: no llamar a Supabase dentro del callback de auth (puede bloquearse)
        setTimeout(refresh, 0);
      }
    });

    // Cleanup: se desuscribe al desmontar
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  // Actualizaciones locales optimistas; la verdad la fija el próximo refresh().
  const add = useCallback((gains: Gain[]) => {
    setStock((prev) => {
      const next = { ...prev };
      let room = CAPACITY - sum(prev);
      for (const g of gains) {
        const take = Math.max(0, Math.min(g.amount, room)); // si la mochila está llena, se descarta el exceso
        next[g.item] += take;
        room -= take;
      }
      return next;
    });
  }, []);

  const consume = useCallback((id: ItemId) => {
    setStock((prev) => (prev[id] > 0 ? { ...prev, [id]: prev[id] - 1 } : prev));
  }, []);

  const value = useMemo<InventoryValue>(
    () => ({ stock, capacity: CAPACITY, total: sum(stock), loading, refresh, add, consume }),
    [stock, loading, refresh, add, consume],
  );

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory(): InventoryValue {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory debe usarse dentro de <InventoryProvider>');
  return ctx;
}