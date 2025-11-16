import { Container, Card, Button } from "@evolution/ui";
import { Sparkles, Users, FileText, Shield } from "lucide-react";

export default function OwnersHome() {
  return (
    <Container className="py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-[#d4a964]">Evolution</span> Owners
        </h1>
        <p className="text-xl text-[#a3a3a3] max-w-2xl mx-auto">
          Register your horses, manage ownership, and access all documentation
          in one compliant platform.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <Card className="p-6 text-center hover:border-[#d4a964] transition-colors">
          <Sparkles className="h-12 w-12 text-[#d4a964] mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Horse Registration</h3>
          <p className="text-sm text-[#a3a3a3]">
            NZTR-compliant registration and asset management
          </p>
        </Card>

        <Card className="p-6 text-center hover:border-[#d4a964] transition-colors">
          <Users className="h-12 w-12 text-[#d4a964] mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Syndicate Management</h3>
          <p className="text-sm text-[#a3a3a3]">
            Create and manage ownership syndicates with ease
          </p>
        </Card>

        <Card className="p-6 text-center hover:border-[#d4a964] transition-colors">
          <FileText className="h-12 w-12 text-[#d4a964] mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Documentation</h3>
          <p className="text-sm text-[#a3a3a3]">
            Auto-generate PDS, agreements, and disclosures
          </p>
        </Card>

        <Card className="p-6 text-center hover:border-[#d4a964] transition-colors">
          <Shield className="h-12 w-12 text-[#d4a964] mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">KYC / AML</h3>
          <p className="text-sm text-[#a3a3a3]">
            Integrated verification for FMA compliance
          </p>
        </Card>
      </div>

      {/* CTA Section */}
      <Card className="p-12 text-center bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-[#a3a3a3] mb-8 max-w-xl mx-auto">
          Register your first horse or create a syndicate in minutes. All
          documentation and compliance handled automatically.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="primary" size="lg">
            Register Horse
          </Button>
          <Button variant="secondary" size="lg">
            View Documentation
          </Button>
        </div>
      </Card>

      {/* Placeholder Notice */}
      <div className="mt-12 p-6 border border-[#d4a964]/30 rounded-lg bg-[#d4a964]/5">
        <p className="text-center text-[#d4a964]">
          🚧 <strong>Module Under Development</strong> - This is a placeholder
          interface for the Owners module. Full registration and management
          features coming soon.
        </p>
      </div>
    </Container>
  );
}
