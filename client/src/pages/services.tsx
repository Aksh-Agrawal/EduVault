import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, BookOpen, Briefcase, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";

export function ServicesPage() {
  const [, navigate] = useLocation();

  const services = [
    {
      id: "attendance",
      title: "Mark Attendance",
      description: "Scan QR to check-in",
      icon: Calendar,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      href: "/dashboard?tab=attendance",
      action: () => navigate("/dashboard?tab=attendance")
    },
    {
      id: "fees",
      title: "Pay Fees",
      description: "UPI payment gateway",
      icon: CreditCard,
      color: "bg-green-500",
      lightColor: "bg-green-50",
      href: "/fees",
      action: () => navigate("/fees")
    },
    {
      id: "library",
      title: "Library Access",
      description: "Check-in/out books",
      icon: BookOpen,
      color: "bg-purple-500",
      lightColor: "bg-purple-50",
      href: "/library",
      action: () => navigate("/library")
    },
    {
      id: "opportunities",
      title: "Opportunities",
      description: "Jobs & internships",
      icon: Briefcase,
      color: "bg-orange-500",
      lightColor: "bg-orange-50",
      href: "/opportunities",
      action: () => navigate("/opportunities")
    }
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Campus Services</h1>
        <p className="text-muted-foreground">Quick access to university services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Card 
              key={service.id} 
              className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
              onClick={service.action}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-lg ${service.lightColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-white ${service.color}`} />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold">{service.title}</CardTitle>
                  <CardDescription className="text-sm">{service.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          More services coming soon. Contact support for assistance.
        </p>
      </div>
    </div>
  );
}