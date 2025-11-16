'use client';

import { Card, Input } from "@evolution/ui";
import { Slider } from "@/components/ui/Slider";

interface ValuationInputsProps {
  leasedStake: number;
  setLeasedStake: (value: number) => void;
  pricePerPercent: number;
  setPricePerPercent: (value: number) => void;
  investorReturn: number;
  setInvestorReturn: (value: number) => void;
  duration: number;
  setDuration: (value: number) => void;
  monthlyCost: number;
  setMonthlyCost: (value: number) => void;
}

export function ValuationInputs({
  leasedStake,
  setLeasedStake,
  pricePerPercent,
  setPricePerPercent,
  investorReturn,
  setInvestorReturn,
  duration,
  setDuration,
  monthlyCost,
  setMonthlyCost,
}: ValuationInputsProps) {
  return (
    <Card className="p-6 bg-[#1a1a1a] border-[#2a2a2a] space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-6 text-white">Lease Parameters</h3>
        
        {/* Leased Stake Slider */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-[#a3a3a3]">
              Leased Stake
            </label>
            <span className="text-[#d4a964] font-semibold text-lg">
              {leasedStake}%
            </span>
          </div>
          <Slider
            value={[leasedStake]}
            onValueChange={([value]: number[]) => setLeasedStake(value)}
            min={1}
            max={100}
            step={1}
            className="mb-2"
          />
          <p className="text-xs text-[#64748b]">
            Percentage of horse being leased to investors
          </p>
        </div>

        {/* Price Per Percent Input */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-3 text-[#a3a3a3]">
            Price ($/1%/Year)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]">
              $
            </span>
            <Input
              type="number"
              value={pricePerPercent}
              onChange={(e) => setPricePerPercent(Number(e.target.value))}
              className="bg-[#0f0f0f] border-[#2a2a2a] pl-8 text-white"
              min={0}
              step={100}
            />
          </div>
          <p className="text-xs text-[#64748b] mt-2">
            Fixed annual price paid by investor per 1% stake
          </p>
        </div>

        {/* Investor's Return Slider */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-[#a3a3a3]">
              Return (Investor's %)
            </label>
            <span className="text-[#d4a964] font-semibold text-lg">
              {investorReturn}%
            </span>
          </div>
          <Slider
            value={[investorReturn]}
            onValueChange={([value]: number[]) => setInvestorReturn(value)}
            min={50}
            max={80}
            step={5}
            className="mb-2"
          />
          <p className="text-xs text-[#64748b]">
            Investor gets {investorReturn}¢ per $1 of stakes won (owner keeps {100 - investorReturn}¢)
          </p>
        </div>

        {/* Investor's Share Slider */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-[#a3a3a3]">
              Lessee's Prize Money %
            </label>
            <span className="text-[#d4a964] font-semibold text-lg">
              {investorReturn}%
            </span>
          </div>
          <Slider
            value={[investorReturn]}
            onValueChange={([value]: number[]) => setInvestorReturn(value)}
            min={50}
            max={80}
            step={5}
            className="mb-2"
          />
          <p className="text-xs text-[#64748b]">
            Lessee's share of prize money (owner keeps {100 - investorReturn}%)
          </p>
        </div>

        {/* Duration Input */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-3 text-[#a3a3a3]">
            Lease Duration (Months)
          </label>
          <Input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Math.max(12, Number(e.target.value)))}
            className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
            min={12}
            step={1}
          />
          <p className="text-xs text-[#64748b] mt-2">
            Minimum 12 months
          </p>
        </div>

        {/* Monthly Cost Input */}
        <div>
          <label className="block text-sm font-medium mb-3 text-[#a3a3a3]">
            Monthly Running Costs ($)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]">
              $
            </span>
            <Input
              type="number"
              value={monthlyCost}
              onChange={(e) => setMonthlyCost(Number(e.target.value))}
              className="bg-[#0f0f0f] border-[#2a2a2a] pl-8 text-white"
              min={0}
              step={500}
            />
          </div>
          <p className="text-xs text-[#64748b] mt-2">
            Total monthly costs for the ENTIRE horse (training, vet, feed)
          </p>
        </div>
      </div>
    </Card>
  );
}
