"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Marketing Manager",
    avatar: "👩‍💼",
    rating: 5,
    text: "FinanceTracker has completely transformed how I manage my money. The Gmail integration is a game-changer - it automatically captures all my receipts!",
  },
  {
    name: "Mike Chen",
    role: "Software Developer",
    avatar: "👨‍💻",
    rating: 5,
    text: "As a developer, I appreciate the clean interface and powerful analytics. The charts help me understand my spending patterns like never before.",
  },
  {
    name: "Emily Rodriguez",
    role: "Small Business Owner",
    avatar: "👩‍💼",
    rating: 5,
    text: "The CSV import feature saved me hours of manual data entry. Now I can focus on growing my business instead of managing spreadsheets.",
  },
  {
    name: "David Park",
    role: "Student",
    avatar: "👨‍🎓",
    rating: 5,
    text: "Perfect for tracking my student budget! The mobile-responsive design means I can check my expenses anywhere on campus.",
  },
  {
    name: "Lisa Thompson",
    role: "Financial Advisor",
    avatar: "👩‍💼",
    rating: 5,
    text: "I recommend FinanceTracker to all my clients. The security features and detailed analytics make it perfect for serious financial planning.",
  },
  {
    name: "James Wilson",
    role: "Freelancer",
    avatar: "👨‍💻",
    rating: 5,
    text: "Managing irregular freelance income was always challenging. This tool helps me plan better and save for lean months.",
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Loved by{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Thousands of Users
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what our users have to say about their experience with FinanceTracker
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">&quot;{testimonial.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
