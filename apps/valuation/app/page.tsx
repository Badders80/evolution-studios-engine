import { Container, Card, Button, Input } from "@evolution/ui";
import { Calculator, TrendingUp, PieChart, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function ValuationHome() {
  return (
    <div className="min-h-screen bg-black">
      <Container className="py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-[#d4a964]">Evolution</span> Valuation
        </h1>
        <p className="text-xl text-[#a3a3a3] max-w-2xl mx-auto">
          Dynamic financial modeling for horse ownership. Calculate ROI, model
          scenarios, and visualize returns.
        </p>
      </div>

      {/* Quick Calculator Preview */}
      <Card className="p-8 mb-16 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Quick ROI Calculator
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div>
            <label className="block text-sm font-medium mb-2 text-[#a3a3a3]">
              Purchase Price
            </label>
            <Input
              type="number"
              placeholder="$50,000"
              className="bg-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-[#a3a3a3]">
              Monthly Costs
            </label>
            <Input
              type="number"
              placeholder="$2,500"
              className="bg-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-[#a3a3a3]">
              Expected Earnings
            </label>
            <Input
              type="number"
              placeholder="$15,000"
              className="bg-[#1a1a1a]"
            />
          </div>
        </div>
        <div className="text-center mt-8">
          <Link href="/calculator">
            <Button variant="primary" size="lg">
              Open Full Calculator
            </Button>
          </Link>
        </div>
      </Card>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <Card className="p-6 text-center hover:border-[#d4a964] transition-colors">
          <Calculator className="h-12 w-12 text-[#d4a964] mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">ROI Calculator</h3>
          <p className="text-sm text-[#a3a3a3]">
            Calculate returns for lease, syndicate, or full ownership
          </p>
        </Card>

        <Card className="p-6 text-center hover:border-[#d4a964] transition-colors">
          <TrendingUp className="h-12 w-12 text-[#d4a964] mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Scenario Modeling</h3>
          <p className="text-sm text-[#a3a3a3]">
            Compare short-term lease vs. full ownership outcomes
          </p>
        </Card>

        <Card className="p-6 text-center hover:border-[#d4a964] transition-colors">
          <PieChart className="h-12 w-12 text-[#d4a964] mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Distribution Breakdown</h3>
          <p className="text-sm text-[#a3a3a3]">
            Visualize fee structures and profit distribution
          </p>
        </Card>

        <Card className="p-6 text-center hover:border-[#d4a964] transition-colors">
          <BarChart3 className="h-12 w-12 text-[#d4a964] mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Performance Reports</h3>
          <p className="text-sm text-[#a3a3a3]">
            Track actual vs. projected returns over time
          </p>
        </Card>
      </div>

      {/* Modeling Types */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 text-[#d4a964]">
            Lease Modeling
          </h3>
          <ul className="space-y-2 text-sm text-[#a3a3a3]">
            <li>• Short-term lease pricing</li>
            <li>• Monthly cash flow projections</li>
            <li>• Break-even analysis</li>
            <li>• Exit scenario planning</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 text-[#d4a964]">
            Syndicate Modeling
          </h3>
          <ul className="space-y-2 text-sm text-[#a3a3a3]">
            <li>• Share pricing calculator</li>
            <li>• Distribution waterfall</li>
            <li>• Fee structure optimization</li>
            <li>• Token yield simulation</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 text-[#d4a964]">
            Full Ownership
          </h3>
          <ul className="space-y-2 text-sm text-[#a3a3a3]">
            <li>• Total cost of ownership</li>
            <li>• Prize money projections</li>
            <li>• Breeding value analysis</li>
            <li>• Long-term ROI tracking</li>
          </ul>
        </Card>
      </div>

      {/* CTA Section */}
      <Card className="p-12 text-center bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]">
        <h2 className="text-3xl font-bold mb-4">
          Make data-driven ownership decisions
        </h2>
        <p className="text-[#a3a3a3] mb-8 max-w-xl mx-auto">
          Model different ownership structures, compare scenarios, and
          understand the true cost and return of horse ownership.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/calculator">
            <Button variant="primary" size="lg">
              Start Modeling
            </Button>
          </Link>
          <Button variant="secondary" size="lg">
            View Sample Reports
          </Button>
        </div>
      </Card>

      {/* Success Notice */}
      <div className="mt-12 p-6 border border-[#4ade80]/30 rounded-lg bg-[#4ade80]/5">
        <p className="text-center text-[#4ade80]">
          ✅ <strong>Valuation Calculator Now Live</strong> - Full lease modeling with breakeven analysis, interactive charts, and real-time calculations.
        </p>
      </div>
    </Container>
    </div>
  );
}
