"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, PieChart, Upload, Mail, Shield, Smartphone, TrendingUp, Bell, Target } from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "Beautiful charts and graphs that help you understand your spending patterns and financial trends.",
    emoji: "📊",
  },
  {
    icon: PieChart,
    title: "Category Breakdown",
    description: "Visualize where your money goes with interactive pie charts and category-wise analysis.",
    emoji: "🥧",
  },
  {
    icon: Upload,
    title: "Easy Import",
    description: "Upload bank statements, SMS exports, or CSV files to automatically import your transactions.",
    emoji: "📤",
  },
  {
    icon: Mail,
    title: "Gmail Integration",
    description: "Automatically extract transaction data from your Gmail receipts and confirmations.",
    emoji: "📧",
  },
  {
    icon: Target,
    title: "Budget Goals",
    description: "Set spending limits and track your progress towards financial goals with smart alerts.",
    emoji: "🎯",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get notified about unusual spending, bill reminders, and budget limit alerts.",
    emoji: "🔔",
  },
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "Your financial data is protected with enterprise-grade encryption and security measures.",
    emoji: "🔒",
  },
  {
    icon: Smartphone,
    title: "Mobile Responsive",
    description: "Access your financial dashboard anywhere, anytime with our fully responsive design.",
    emoji: "📱",
  },
  {
    icon: TrendingUp,
    title: "Trend Analysis",
    description: "Identify spending trends and patterns to make better financial decisions.",
    emoji: "📈",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Master Your Finances
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful features designed to give you complete control over your financial life, from expense tracking to
            goal setting and beyond.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">{feature.emoji}</span>
                  </div>
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
