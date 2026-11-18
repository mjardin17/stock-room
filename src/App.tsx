import { useCallback, useEffect, useMemo, useState } from 'react';
import * as stockApi from './api/stockApi';
import { Navbar, type AppScreen } from './components/Navbar';
import { SendToSellScreen } from './components/SendToSellScreen';
import { StockRoomScreen } from './components/StockRoomScreen';
import type { StageSummary, StockItem } from './types';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<AppScreen>('stock-room');
  const [items, setItems] = useState<StockItem[]>([]);
  const [stages, setStages] = useState<StageSummary[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalUnits, setTotalUnits] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshStock = useCallback(async () => {
    const res = await stockApi.listStock();
    setItems(res.items);
    setStages(res.stages);
    setTotalItems(res.totalItems);
    setTotalUnits(res.totalUnits);
  }, []);

  useEffect(() => {
    let active = true;
    async function init() {
      setLoading(true);
      try {
        const res = await stockApi.listStock();
        if (!active) return;
        setItems(res.items);
        setStages(res.stages);
        setTotalItems(res.totalItems);
        setTotalUnits(res.totalUnits);
      } finally {
        if (active) setLoading(false);
      }
    }
    void init();
    return () => {
      active = false;
    };
  }, []);

  const readyItems = useMemo(
    () => items.filter((item) => item.stage === 'Ready'),
    [items],
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        readyCount={readyItems.length}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {activeScreen === 'stock-room' ? (
          <StockRoomScreen
            items={items}
            stages={stages}
            totalItems={totalItems}
            totalUnits={totalUnits}
            loading={loading}
            onRefresh={refreshStock}
          />
        ) : (
          <SendToSellScreen
            readyItems={readyItems}
            onInventoryChanged={refreshStock}
          />
        )}
      </main>
    </div>
  );
}
