'use client';

import { Card } from "@evolution/ui";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface ChartDataPoint {
  winnings: number;
  leaseRevenue: number;
  noLeaseRevenue: number;
}

interface BreakevenChartProps {
  chartData: ChartDataPoint[];
  breakevenPoint: number;
}

export function BreakevenChart({ chartData, breakevenPoint }: BreakevenChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 rounded-lg shadow-lg">
          <p className="text-[#a3a3a3] text-sm mb-2">
            <span className="font-semibold">Winnings:</span>{' '}
            {formatCurrency(payload[0].payload.winnings)}
          </p>
          <p className="text-[#d4a964] text-sm mb-1">
            <span className="font-semibold">Lease Model:</span>{' '}
            {formatCurrency(payload[0].value)}
          </p>
          <p className="text-[#f87171] text-sm">
            <span className="font-semibold">No Lease:</span>{' '}
            {formatCurrency(payload[1].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 bg-[#1a1a1a] border-[#2a2a2a]">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">
          Breakeven Analysis
        </h3>
        <p className="text-sm text-[#a3a3a3]">
          Compare lease vs. no-lease scenarios based on total winnings
        </p>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#2a2a2a"
              vertical={false}
            />
            <XAxis
              dataKey="winnings"
              stroke="#64748b"
              tick={{ fill: '#a3a3a3', fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value)}
              label={{
                value: 'Total Horse Winnings',
                position: 'insideBottom',
                offset: -5,
                style: { fill: '#a3a3a3', fontSize: 14 },
              }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#a3a3a3', fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value)}
              label={{
                value: 'Net Revenue (Based on Leased %)',
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#a3a3a3', fontSize: 14 },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
              formatter={(value) => (
                <span style={{ color: '#a3a3a3', fontSize: 14 }}>{value}</span>
              )}
            />
            
            {/* Breakeven vertical line */}
            <ReferenceLine
              x={breakevenPoint}
              stroke="#d4a964"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: 'Breakeven',
                position: 'top',
                fill: '#d4a964',
                fontSize: 12,
                fontWeight: 600,
              }}
            />
            
            {/* Zero line */}
            <ReferenceLine
              y={0}
              stroke="#64748b"
              strokeWidth={1}
            />
            
            {/* Lease Model Line */}
            <Line
              type="monotone"
              dataKey="leaseRevenue"
              stroke="#d4a964"
              strokeWidth={3}
              dot={false}
              name="Lease Model"
              activeDot={{ r: 6, fill: '#d4a964' }}
            />
            
            {/* No Lease Model Line */}
            <Line
              type="monotone"
              dataKey="noLeaseRevenue"
              stroke="#f87171"
              strokeWidth={3}
              dot={false}
              name="No Lease Model"
              activeDot={{ r: 6, fill: '#f87171' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend Description */}
      <div className="mt-6 grid md:grid-cols-2 gap-4 text-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-0.5 bg-[#d4a964] mt-2"></div>
          <div>
            <p className="font-semibold text-[#d4a964] mb-1">Lease Model</p>
            <p className="text-[#64748b] text-xs">
              Includes lease income offset by costs. Better at lower winnings.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-0.5 bg-[#f87171] mt-2"></div>
          <div>
            <p className="font-semibold text-[#f87171] mb-1">No Lease Model</p>
            <p className="text-[#64748b] text-xs">
              Pure ownership. Better at higher winnings above breakeven.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
