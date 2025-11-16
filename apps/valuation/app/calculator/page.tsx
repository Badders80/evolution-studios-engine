'use client';

import { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

export default function CalculatorPage() {
  // Input States
  const [duration, setDuration] = useState(12); // months
  const [leasePercent, setLeasePercent] = useState(10); // percentage (10 = 10%)
  const [priceMode, setPriceMode] = useState<'monthly' | 'total'>('monthly');
  const [monthlyRate, setMonthlyRate] = useState(40); // $/month per 1%
  const [totalPrice, setTotalPrice] = useState(4800); // total $
  const [investorShare, setInvestorShare] = useState(80); // percentage of leased winnings
  const [costPerMonth, setCostPerMonth] = useState(40); // $/month per 1%
  const [showResults, setShowResults] = useState(false);

  // Calculate derived values
  const calculations = useMemo(() => {
    const P = leasePercent / 100; // Convert to decimal
    const L = priceMode === 'monthly' ? monthlyRate : totalPrice / (duration * leasePercent);
    const D = duration;
    const C = costPerMonth;
    const investorShareDecimal = investorShare / 100;

    // Total lease revenue (fixed income to owner)
    const totalLeaseRevenue = D * P * 100 * L;

    // Total costs for leased percentage
    const totalCostP = D * P * 100 * C;

    // Owner's share of winnings on leased portion
    const ownerWinningsSharePercent = (1 - investorShareDecimal) * 100;
    const effectiveRetention = 1 - (investorShareDecimal * P);

    // Monthly values
    const monthlyLeaseRevenue = P * 100 * L;
    const monthlyCostP = P * 100 * C;
    const monthlyNetNoWinnings = monthlyLeaseRevenue - monthlyCostP;

    // Breakeven winnings (where both scenarios yield same net revenue)
    // Without lease: P * W - totalCostP
    // With lease: totalLeaseRevenue + P * (1 - investorShareDecimal) * W - totalCostP
    // Setting equal: P * W = totalLeaseRevenue + P * (1 - investorShareDecimal) * W
    // Solving: W = totalLeaseRevenue / (P * investorShareDecimal)
    const breakevenWinnings = totalLeaseRevenue / (P * investorShareDecimal);

    // Generate graph data centered on breakeven
    // Set max to 2x breakeven so breakeven is in the middle
    const maxW = breakevenWinnings * 2;
    const points = 100;
    const wValues = Array.from({ length: points }, (_, i) => (i * maxW) / (points - 1));
    
    const withLeaseData = wValues.map(w => 
      totalLeaseRevenue + (P * (1 - investorShareDecimal) * w) - totalCostP
    );
    
    const withoutLeaseData = wValues.map(w => 
      (P * w) - totalCostP
    );

    return {
      P,
      L,
      D,
      totalLeaseRevenue,
      totalCostP,
      ownerWinningsSharePercent,
      effectiveRetention: effectiveRetention * 100,
      monthlyLeaseRevenue,
      monthlyCostP,
      monthlyNetNoWinnings,
      totalNetNoWinnings: D * monthlyNetNoWinnings,
      breakevenWinnings,
      wValues,
      withLeaseData,
      withoutLeaseData,
    };
  }, [duration, leasePercent, priceMode, monthlyRate, totalPrice, investorShare, costPerMonth]);

  const handleCalculate = () => {
    if (duration > 0 && leasePercent > 0 && (priceMode === 'monthly' ? monthlyRate > 0 : totalPrice > 0)) {
      setShowResults(true);
    }
  };

  // Chart configuration
  const chartData = {
    labels: calculations.wValues.map(w => `$${(w / 1000).toFixed(0)}k`),
    datasets: [
      {
        label: 'With Lease (Fixed + Performance)',
        data: calculations.withLeaseData,
        borderColor: '#60a5fa',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(96, 165, 250, 0.3)');
          gradient.addColorStop(1, 'rgba(96, 165, 250, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: 'Without Lease (100% Risk)',
        data: calculations.withoutLeaseData,
        borderColor: '#f87171',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(248, 113, 113, 0.2)');
          gradient.addColorStop(1, 'rgba(248, 113, 113, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ededed',
          font: { family: 'var(--font-sans)', size: 12 },
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(10, 10, 10, 0.95)',
        titleColor: '#d4a964',
        bodyColor: '#ededed',
        borderColor: '#d4a964',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(0)}`;
          },
        },
      },
      annotation: {
        annotations: showResults ? {
          breakeven: {
            type: 'line',
            xMin: calculations.wValues.findIndex(w => w >= calculations.breakevenWinnings),
            xMax: calculations.wValues.findIndex(w => w >= calculations.breakevenWinnings),
            borderColor: '#d4a964',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              display: true,
              content: `Breakeven: $${(calculations.breakevenWinnings / 1000).toFixed(0)}k`,
              position: 'start',
              backgroundColor: '#d4a964',
              color: '#000000',
              font: { size: 11, weight: 'bold' },
              padding: 6,
            },
          },
        } : {},
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Total Winnings ($)',
          color: '#999999',
          font: { family: 'var(--font-sans)', size: 12 },
        },
        ticks: {
          color: '#999999',
          maxTicksLimit: 10,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Net Revenue (Pro-Rated to Lease %)',
          color: '#999999',
          font: { family: 'var(--font-sans)', size: 12 },
        },
        ticks: {
          color: '#999999',
          callback: (value) => `$${(value as number / 1000).toFixed(0)}k`,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-light text-foreground tracking-tight">
              Value Your Horse: <span className="text-primary font-medium">Lease & Syndicate Smart</span>
            </h1>
            <p className="text-lg text-muted max-w-3xl mx-auto">
              Interactive tool to demystify leasing. See how fixed revenue + performance share compares to full retention.
              Build from a blank graph to visualize your breakeven point.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Core */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Graph - Left 2/3 */}
          <div className="lg:col-span-2">
            <div className="bg-surface border border-border rounded-lg p-6 h-[600px]">
              {!showResults ? (
                <div className="h-full flex items-center justify-center text-center">
                  <div className="space-y-4">
                    <div className="text-6xl">📊</div>
                    <h3 className="text-2xl font-medium text-foreground">Build Your Graph</h3>
                    <p className="text-muted">Enter your lease parameters to visualize the comparison</p>
                  </div>
                </div>
              ) : (
                <div className="h-full">
                  <Line data={chartData} options={chartOptions} />
                  <p className="text-sm text-muted mt-4 text-center">
                    Below ${(calculations.breakevenWinnings / 1000).toFixed(0)}k: Lease turns ${(calculations.totalCostP / 1000).toFixed(1)}k loss into ${(calculations.totalLeaseRevenue / 1000).toFixed(1)}k gain
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Inputs - Right 1/3 */}
          <div className="lg:col-span-1">
            <div className="bg-surface border border-border rounded-lg p-6 space-y-6 sticky top-20">
              <h2 className="text-xl font-medium text-foreground border-b border-border pb-3">
                Lease Parameters
              </h2>

              {/* Duration */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Duration (months)</label>
                <input
                  type="number"
                  min="3"
                  max="24"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Lease Percentage */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex justify-between">
                  <span>Lease Size</span>
                  <span className="text-primary">{leasePercent}%</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={leasePercent}
                  onChange={(e) => setLeasePercent(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted">
                  <span>5%</span>
                  <span>50%</span>
                </div>
              </div>

              {/* Price Mode */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Lease Price</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPriceMode('monthly')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      priceMode === 'monthly'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border border-border text-muted hover:text-foreground'
                    }`}
                  >
                    Per 1% Monthly
                  </button>
                  <button
                    onClick={() => setPriceMode('total')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      priceMode === 'total'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border border-border text-muted hover:text-foreground'
                    }`}
                  >
                    Total $
                  </button>
                </div>
                {priceMode === 'monthly' ? (
                  <input
                    type="number"
                    min="1"
                    value={monthlyRate}
                    onChange={(e) => setMonthlyRate(Number(e.target.value))}
                    placeholder="$/month per 1%"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <input
                    type="number"
                    min="1"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(Number(e.target.value))}
                    placeholder="Total $"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                )}
              </div>

              {/* Investor Revenue Share */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex justify-between">
                  <span>Investor Winnings Share</span>
                  <span className="text-primary">{investorShare}%</span>
                </label>
                <input
                  type="range"
                  min="70"
                  max="90"
                  step="1"
                  value={investorShare}
                  onChange={(e) => setInvestorShare(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted">
                  <span>70%</span>
                  <span>90%</span>
                </div>
                <p className="text-xs text-muted">Owner retains {100 - investorShare}% of leased winnings</p>
              </div>

              {/* Calculate Button */}
              <button
                onClick={handleCalculate}
                className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
              >
                Calculate Breakeven
              </button>

              <p className="text-xs text-muted text-center">
                Try 12mo / 10% / $40 for $4,800 example
              </p>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="mt-12 space-y-8">
            {/* Owner Metrics Table */}
            <div className="bg-surface border border-primary/30 rounded-lg overflow-hidden">
              <div className="bg-primary/10 px-6 py-4 border-b border-primary/30">
                <h2 className="text-xl font-medium text-foreground">Owner Metrics</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-6 py-3 text-left text-sm font-medium text-muted">Metric</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-muted">Monthly</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-muted">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-6 py-4 text-sm text-foreground">Lease Revenue</td>
                      <td className="px-6 py-4 text-sm text-right text-primary font-medium">${calculations.monthlyLeaseRevenue.toFixed(0)}</td>
                      <td className="px-6 py-4 text-sm text-right text-primary font-medium">${calculations.totalLeaseRevenue.toFixed(0)}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-foreground">Costs (Leased {leasePercent}%)</td>
                      <td className="px-6 py-4 text-sm text-right text-foreground">${calculations.monthlyCostP.toFixed(0)}</td>
                      <td className="px-6 py-4 text-sm text-right text-foreground">${calculations.totalCostP.toFixed(0)}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-foreground">Net (No Winnings)</td>
                      <td className="px-6 py-4 text-sm text-right text-foreground">${calculations.monthlyNetNoWinnings.toFixed(0)}</td>
                      <td className="px-6 py-4 text-sm text-right text-foreground">${calculations.totalNetNoWinnings.toFixed(0)}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-foreground">Owner Winnings Share</td>
                      <td className="px-6 py-4 text-sm text-right text-muted">N/A</td>
                      <td className="px-6 py-4 text-sm text-right text-primary font-medium">{calculations.effectiveRetention.toFixed(1)}% of total</td>
                    </tr>
                    <tr className="bg-primary/5">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">Breakeven Winnings</td>
                      <td className="px-6 py-4 text-sm text-right text-muted">N/A</td>
                      <td className="px-6 py-4 text-sm text-right text-primary font-bold">${calculations.breakevenWinnings.toFixed(0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Investor Quick View */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <h3 className="text-lg font-medium text-foreground mb-3">Investor Quick View</h3>
              <p className="text-muted">
                For a 1% stake: Pay <span className="text-primary font-medium">${(calculations.totalLeaseRevenue / leasePercent).toFixed(0)}</span> over {duration} months. 
                Get <span className="text-primary font-medium">{investorShare}%</span> of winnings from leased portion 
                (e.g., ${(investorShare / 100 * 1).toFixed(2)} per $1 won).
              </p>
            </div>

            {/* Benefits Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: '↑',
                  title: 'Favorable Below Breakeven',
                  description: `Lease outperforms under $${(calculations.breakevenWinnings / 1000).toFixed(0)}k winnings, transferring risk.`
                },
                {
                  icon: '💰',
                  title: 'Guaranteed Income',
                  description: `Secure $${calculations.monthlyLeaseRevenue.toFixed(0)}/mo or $${calculations.totalLeaseRevenue.toFixed(0)} over ${duration}mo, race-independent.`
                },
                {
                  icon: '🛡️',
                  title: 'Risk Reduction',
                  description: `Minimize exposure while maintaining ${calculations.effectiveRetention.toFixed(0)}% winnings potential.`
                },
                {
                  icon: '📉',
                  title: 'Cost Coverage',
                  description: `${leasePercent}% lease covers 100% of leased costs, reducing burden.`
                },
                {
                  icon: '📈',
                  title: 'Positive Cash Flow',
                  description: `Flip ${calculations.totalCostP < 0 ? '-' : ''}$${Math.abs(calculations.totalCostP / 1000).toFixed(1)}k loss to $${(calculations.totalNetNoWinnings / 1000).toFixed(1)}k.`
                },
                {
                  icon: '🏆',
                  title: 'Winnings Upside',
                  description: `Retain ${calculations.effectiveRetention.toFixed(0)}% + 100% appreciation/control.`
                },
              ].map((benefit, i) => (
                <div key={i} className="bg-surface border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                  <div className="text-4xl mb-3">{benefit.icon}</div>
                  <h4 className="text-lg font-medium text-foreground mb-2">{benefit.title}</h4>
                  <p className="text-sm text-muted">{benefit.description}</p>
                </div>
              ))}
            </div>

            {/* Explanation Table */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <div className="bg-primary/10 px-6 py-4 border-b border-primary/30">
                  <h3 className="text-lg font-medium text-foreground">First-Time Investors</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Easy Onboarding</h4>
                    <p className="text-sm text-muted">Guided process lowers barriers.</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Increased Liquidity</h4>
                    <p className="text-sm text-muted">Trade stakes flexibly.</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Reduced Risk</h4>
                    <p className="text-sm text-muted">Fixed terms minimize exposure.</p>
                  </div>
                </div>
              </div>

              <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <div className="bg-primary/10 px-6 py-4 border-b border-primary/30">
                  <h3 className="text-lg font-medium text-foreground">Existing Owners</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Steady Income</h4>
                    <p className="text-sm text-muted">${calculations.monthlyLeaseRevenue.toFixed(0)}/mo fixed revenue stream.</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Capital Appreciation</h4>
                    <p className="text-sm text-muted">Retain full value gains.</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Full Control</h4>
                    <p className="text-sm text-muted">Decide care/strategy + extra income.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Footer */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-medium text-foreground mb-4">Ready to Syndicate?</h2>
              <p className="text-muted mb-6">List on the marketplace or download our comprehensive guide</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity">
                  Sign Up
                </button>
                <button className="px-6 py-3 bg-surface border border-border text-foreground rounded-md font-medium hover:border-primary transition-colors">
                  Download PDF Guide
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
