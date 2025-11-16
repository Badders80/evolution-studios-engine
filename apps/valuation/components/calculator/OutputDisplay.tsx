'use client';

import { Card } from "@evolution/ui";
import { TrendingUp, DollarSign, Target, PieChart } from "lucide-react";

interface CalculationsResult {
  totalLeaseIncome: number;
  totalRunningCosts: number;
  leaseModelStart: number;
  noLeaseModelStart: number;
  ownerPrizeShare: number;
  breakevenPoint: number;
  chartData: Array<{ winnings: number; leaseRevenue: number; noLeaseRevenue: number }>;
}

interface OutputDisplayProps {
  calculations: CalculationsResult;
}

export function OutputDisplay({ calculations }: OutputDisplayProps) {
  const formatCurrency = (value: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(value));
    
    return value < 0 ? `-${formatted}` : formatted;
  };

  const metrics = [
    {
      icon: TrendingUp,
      label: 'Lease Income',
      value: formatCurrency(calculations.totalLeaseIncome),
      description: 'Total guaranteed income from lease',
      color: 'text-[#4ade80]',
      bgColor: 'bg-[#4ade80]/10',
    },
    {
      icon: DollarSign,
      label: 'Total Running Costs',
      value: formatCurrency(calculations.totalRunningCosts),
      description: 'Total costs over lease period',
      color: 'text-[#f87171]',
      bgColor: 'bg-[#f87171]/10',
    },
    {
      icon: Target,
      label: 'Breakeven Stakes Won',
      value: formatCurrency(calculations.breakevenPoint),
      description: 'Stakes won where lease = no lease',
      color: 'text-[#d4a964]',
      bgColor: 'bg-[#d4a964]/10',
    },
    {
      icon: PieChart,
      label: "Owner's Prize Share",
      value: `${calculations.ownerPrizeShare}%`,
      description: `You keep ${calculations.ownerPrizeShare}% of all stakes won`,
      color: 'text-[#60a5fa]',
      bgColor: 'bg-[#60a5fa]/10',
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card
            key={index}
            className="p-6 bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a] transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <Icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-[#a3a3a3] mb-2">
              {metric.label}
            </h3>
            <p className={`text-3xl font-bold mb-2 ${metric.color}`}>
              {metric.value}
            </p>
            <p className="text-xs text-[#64748b]">{metric.description}</p>
          </Card>
        );
      })}
    </div>
  );
}
