import Link from 'next/link';
import { Calendar, Users, CreditCard, Award, ArrowUpRight, ArrowDownRight, PlusCircle } from 'lucide-react';

const stats = [
  {
    label: 'Total Events',
    value: '24',
    change: '+12%',
    trend: 'up',
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    label: 'Total Attendees',
    value: '1,847',
    change: '+8%',
    trend: 'up',
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    label: 'Revenue',
    value: 'KES 284,500',
    change: '+23%',
    trend: 'up',
    icon: CreditCard,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    label: 'Certificates Issued',
    value: '1,203',
    change: '-2%',
    trend: 'down',
    icon: Award,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here&apos;s what&apos;s happening with your events.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                  {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-3">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Events</h3>
            <Link href="/dashboard/events" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3 pb-4 border-b border-gray-50">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Data Science Workshop</p>
                <p className="text-xs text-gray-500">July 28, 2024 · 45 attendees</p>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Completed</span>
            </div>
            <div className="flex items-start gap-3 pb-4 border-b border-gray-50">
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Financial Literacy Webinar</p>
                <p className="text-xs text-gray-500">August 2, 2024 · 78 attendees</p>
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Upcoming</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard/events/new" className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <PlusCircle className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-gray-700">Create Event</span>
            </Link>
            <Link href="/dashboard/attendees" className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">View Attendees</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}