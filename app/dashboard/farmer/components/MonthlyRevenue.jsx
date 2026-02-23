"use client";
import React, { useState, useMemo } from "react";
import { Area } from "@ant-design/plots";

export default function MonthlyRevenue({ sellerOrders = [], initialRange = '6m' }) {
  const [range, setRange] = useState(initialRange);

  const monthlyData = useMemo(() => {
    const now = new Date();
    // only delivered orders contribute to revenue
    const orders = (sellerOrders || []).filter((o) => o.status === 'delivered');

    const groupBy = (labels, keyFn) => {
      const buckets = labels.map((label) => ({ label, total: 0 }));
      for (const o of orders) {
        const dt = new Date(o.orderDate || o.createdAt);
        const k = keyFn(dt);
        const idx = labels.indexOf(k);
        if (idx !== -1) buckets[idx].total += Number(o.totalPrice) || 0;
      }
      return buckets;
    };

    if (range === 'today') {
      const labels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
      return groupBy(labels, (dt) => `${String(dt.getHours()).padStart(2, '0')}:00`).map((m) => ({ label: m.label, revenue: m.total }));
    }

    if (range === '7d') {
      const labels = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        labels.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
      }
      return groupBy(labels, (dt) => dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })).map((m) => ({ label: m.label, revenue: m.total }));
    }

    if (range === '1m') {
      const labels = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        labels.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
      }
      return groupBy(labels, (dt) => dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })).map((m) => ({ label: m.label, revenue: m.total }));
    }

    if (range === '6m') {
      const labels = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(d.toLocaleString('default', { month: 'short' }));
      }
      return groupBy(labels, (dt) => dt.toLocaleString('default', { month: 'short' })).map((m) => ({ label: m.label, revenue: m.total }));
    }

    // max
    const dates = orders.map((o) => new Date(o.orderDate || o.createdAt)).filter(Boolean);
    if (dates.length === 0) return []; // fallback
    const earliest = new Date(Math.min(...dates.map((d) => d.getTime())));
    const labels = [];
    let cursor = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    while (cursor <= end) {
      labels.push(cursor.toLocaleString('default', { month: 'short', year: 'numeric' }));
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
    return groupBy(labels, (dt) => dt.toLocaleString('default', { month: 'short', year: 'numeric' })).map((m) => ({ label: m.label, revenue: m.total }));
  }, [sellerOrders, range]);

  const areaConfig = useMemo(() => ({
    data: monthlyData,
    xField: 'label',
    yField: 'revenue',
    smooth: true,
    height: 180,
    padding: 'auto',
    areaStyle: { fill: 'l(270) 0:#f0fff4 0.6:#c6f6d5 1:#9ae6b4' },
    line: { color: '#16a34a', size: 2 },
    point: { size: 4, shape: 'circle', style: { fill: '#16a34a', stroke: '#fff' } },
    tooltip: {
      showTitle: true,
      formatter: (datum) => ({ name: 'Revenue', value: Number(datum.revenue || 0) }),
      showCrosshairs: true,
      customContent: (title, items) => {
        const point = monthlyData.find((d) => String(d.label) === String(title));
        const v = point ? Number(point.revenue || 0) : (items && items[0] && Number(items[0].value || 0));
        return `
          <div class="p-2 text-sm bg-white shadow rounded" style="min-width:140px">
            <div class="text-xs text-gray-500">${title}</div>
            <div class="mt-1 font-semibold">NPR ${((v || 0).toLocaleString())}</div>
          </div>
        `;
      },
    },
    interactions: [{ type: 'marker-active' }, { type: 'element-active' }, { type: 'active-region' }],
    xAxis: { label: { style: { fill: '#4b5563' }, autoRotate: false } },
    yAxis: { label: { formatter: (v) => (v ? `NPR ${Number(v).toLocaleString()}` : 'NPR 0') } },
    responsive: true,
  }), [monthlyData]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border h-[260px] flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Monthly Revenue</h3>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-600"
          >
            <option value="today">Today</option>
            <option value="7d">7 Days</option>
            <option value="1m">1 Month</option>
            <option value="6m">6 Months</option>
            <option value="max">All time</option>
          </select>
          <div className="text-xs text-gray-400">{range === 'today' ? 'Today' : range === '7d' ? 'Last 7 days' : range === '1m' ? 'Last 30 days' : range === '6m' ? 'Last 6 months' : 'All time'}</div>
        </div>
      </div>

      <div className="flex-1">
        <Area {...areaConfig} />
      </div>
    </div>
  );
}
