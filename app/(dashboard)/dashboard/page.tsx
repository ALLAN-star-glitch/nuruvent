import Link from 'next/link';
import { 
  Calendar, 
  Users, 
  CreditCard, 
  Award, 
  ArrowUpRight, 
  ArrowDownRight, 
  PlusCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  Video,
  FileText,
  DollarSign,
  AlertCircle,
  Zap,
  Activity,
  BarChart3,
  PieChart,
  Eye,
  MessageSquare,
  Share2,
  Gift,
  Sparkles,
  Target,
  Lightbulb,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const stats = [
  {
    label: 'Total Events',
    value: '24',
    change: '+12%',
    trend: 'up',
    icon: Calendar,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    description: '4 scheduled this month',
  },
  {
    label: 'Total Attendees',
    value: '1,847',
    change: '+8%',
    trend: 'up',
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: '156 new this week',
  },
  {
    label: 'Revenue',
    value: 'KES 284,500',
    change: '+23%',
    trend: 'up',
    icon: CreditCard,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    description: 'KES 12,400 commission',
  },
  {
    label: 'Certificates Issued',
    value: '1,203',
    change: '-2%',
    trend: 'down',
    icon: Award,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: '24 pending verification',
  },
];

const recentEvents = [
  {
    id: 1,
    title: 'Data Science with Python Workshop',
    date: 'July 28, 2024',
    attendees: 45,
    status: 'Completed',
    statusColor: 'text-green-600 bg-green-50',
    progress: 100,
  },
  {
    id: 2,
    title: 'Financial Literacy Webinar',
    date: 'August 2, 2024',
    attendees: 78,
    status: 'Upcoming',
    statusColor: 'text-blue-600 bg-blue-50',
    progress: 65,
  },
  {
    id: 3,
    title: 'UI/UX Design Bootcamp',
    date: 'August 10, 2024',
    attendees: 32,
    status: 'Draft',
    statusColor: 'text-amber-600 bg-amber-50',
    progress: 30,
  },
  {
    id: 4,
    title: 'DevOps Fundamentals Workshop',
    date: 'August 15, 2024',
    attendees: 56,
    status: 'Live',
    statusColor: 'text-red-600 bg-red-50',
    progress: 100,
  },
  {
    id: 5,
    title: 'Cloud Architecture Masterclass',
    date: 'August 20, 2024',
    attendees: 43,
    status: 'Scheduled',
    statusColor: 'text-indigo-600 bg-indigo-50',
    progress: 0,
  },
];

const quickStats = [
  { label: 'Active Events', value: '8', icon: Zap, color: 'text-primary' },
  { label: 'Avg. Attendance', value: '64', icon: Users, color: 'text-green-600' },
  { label: 'Completion Rate', value: '87%', icon: CheckCircle2, color: 'text-emerald-600' },
  { label: 'CPD Hours Tracked', value: '4,231', icon: Clock, color: 'text-amber-600' },
];

const upcomingTasks = [
  { task: 'Review event registrations', deadline: 'Today, 5:00 PM', priority: 'High' },
  { task: 'Issue CPD certificates', deadline: 'Tomorrow, 12:00 PM', priority: 'Medium' },
  { task: 'Prepare webinar slides', deadline: 'Aug 5, 3:00 PM', priority: 'High' },
  { task: 'Send event reminders', deadline: 'Aug 6, 9:00 AM', priority: 'Low' },
];

const performanceMetrics = [
  { label: 'Attendee Satisfaction', value: 92, color: 'bg-green-500' },
  { label: 'Event Completion', value: 85, color: 'bg-blue-500' },
  { label: 'Certificate Issuance', value: 78, color: 'bg-purple-500' },
  { label: 'Revenue Growth', value: 63, color: 'bg-amber-500' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Welcome Header with Date/Time */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-500 flex flex-wrap items-center gap-2">
            <span>Welcome back! Here&apos;s what&apos;s happening with your events.</span>
            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 text-xs sm:text-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              <span className="hidden xs:inline">Pro Plan</span>
              <span className="xs:hidden">Pro</span>
            </Badge>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="text-right text-xs sm:text-sm">
            <p className="text-gray-500 hidden xs:block">Today</p>
            <p className="font-medium text-gray-700 text-xs sm:text-sm">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="h-6 sm:h-8 w-px bg-gray-200 hidden xs:block" />
          <div className="flex items-center gap-1 sm:gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs sm:text-sm">
              <Activity className="h-3 w-3 mr-1" />
              <span className="hidden xs:inline">Live:</span> 1
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Grid - Responsive columns */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-3 sm:p-4 lg:p-5">
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    ) : (
                      <ArrowDownRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    )}
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2 sm:mt-3">{stat.value}</p>
                <p className="text-xs sm:text-sm font-medium text-gray-700">{stat.label}</p>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats Row - Responsive grid */}
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-gray-200/60 shadow-sm">
              <CardContent className="p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
                <div className={`p-1.5 sm:p-2 rounded-lg bg-gray-50 flex-shrink-0`}>
                  <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${stat.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Grid - Responsive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Events - Takes full width on mobile, 2/3 on desktop */}
        <div className="lg:col-span-2">
          <Card className="border-gray-200/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-5 pt-3 sm:pt-5">
              <CardTitle className="text-sm sm:text-base font-semibold">Recent Events</CardTitle>
              <Link 
                href="/dashboard/events" 
                className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1"
              >
                <span className="hidden xs:inline">View all</span>
                <span className="xs:hidden">All</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="px-2 sm:px-4 lg:px-5 pb-3 sm:pb-5">
              <div className="space-y-2 sm:space-y-3">
                {recentEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50/80 transition-all border border-transparent hover:border-gray-100 group"
                  >
                    <div className="flex items-center gap-3 w-full xs:w-auto">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Calendar className="h-4 w-4 sm:h-4.5 sm:w-4.5 lg:h-5 lg:w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{event.title}</p>
                          <Badge variant="outline" className={`text-[10px] sm:text-xs ${event.statusColor} border-0 px-1.5 py-0 sm:px-2.5 sm:py-0.5`}>
                            {event.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500 mt-0.5">
                          <span>{event.date}</span>
                          <span className="hidden xs:inline">•</span>
                          <span className="xs:inline hidden">{event.attendees} attendees</span>
                          <span className="xs:hidden">{event.attendees}</span>
                          {event.progress > 0 && event.progress < 100 && (
                            <>
                              <span className="hidden xs:inline">•</span>
                              <span className="text-amber-600 hidden xs:inline">{event.progress}%</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-auto xs:ml-0 w-full xs:w-auto">
                      {event.progress > 0 && event.progress < 100 && (
                        <div className="flex-1 xs:w-16">
                          <Progress value={event.progress} className="h-1 sm:h-1.5" />
                        </div>
                      )}
                      {event.progress === 100 && (
                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Responsive stack on mobile */}
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Actions */}
          <Card className="border-gray-200/80 shadow-sm">
            <CardHeader className="pb-2 px-3 sm:px-5 pt-3 sm:pt-5">
              <CardTitle className="text-sm sm:text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-4 lg:px-5 pb-3 sm:pb-5 space-y-1.5 sm:space-y-2">
              <Link 
                href="/dashboard/events/new" 
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 bg-gray-50 hover:bg-primary/5 rounded-lg transition-colors border border-gray-100 hover:border-primary/20 group"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                  <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-primary transition-colors truncate">
                  Create New Event
                </span>
                <Sparkles className="h-3 w-3 text-primary ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </Link>
              
              <Link 
                href="/dashboard/attendees" 
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 bg-gray-50 hover:bg-green-50 rounded-lg transition-colors border border-gray-100 hover:border-green-200 group"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors flex-shrink-0">
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-green-700 transition-colors truncate">
                  View Attendees
                </span>
              </Link>

              <Link 
                href="/dashboard/certificates" 
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 bg-gray-50 hover:bg-amber-50 rounded-lg transition-colors border border-gray-100 hover:border-amber-200 group"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors flex-shrink-0">
                  <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-amber-700 transition-colors truncate">
                  Issue Certificates
                </span>
                <Badge variant="secondary" className="ml-auto text-[10px] sm:text-xs bg-amber-100 text-amber-700 flex-shrink-0">
                  6
                </Badge>
              </Link>

              <Link 
                href="/dashboard/replays" 
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 bg-gray-50 hover:bg-purple-50 rounded-lg transition-colors border border-gray-100 hover:border-purple-200 group"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors flex-shrink-0">
                  <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-purple-700 transition-colors truncate">
                  Manage Replays
                </span>
              </Link>

              <Link 
                href="/dashboard/revenue" 
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border border-gray-100 hover:border-blue-200 group"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors flex-shrink-0">
                  <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors truncate">
                  View Revenue
                </span>
              </Link>
            </CardContent>
          </Card>

          {/* Upcoming Tasks - Hidden on smallest screens */}
          <Card className="border-gray-200/80 shadow-sm hidden xs:block">
            <CardHeader className="pb-2 px-3 sm:px-5 pt-3 sm:pt-5">
              <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                <span className="truncate">Upcoming Tasks</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-4 lg:px-5 pb-3 sm:pb-5 space-y-1.5 sm:space-y-2">
              {upcomingTasks.slice(0, 3).map((task, index) => (
                <div key={index} className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${
                    task.priority === 'High' ? 'bg-red-500' :
                    task.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">{task.task}</p>
                    <p className="text-[10px] sm:text-xs text-gray-400">{task.deadline}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] sm:text-xs flex-shrink-0 ${
                    task.priority === 'High' ? 'text-red-600 border-red-200 bg-red-50' :
                    task.priority === 'Medium' ? 'text-amber-600 border-amber-200 bg-amber-50' :
                    'text-blue-600 border-blue-200 bg-blue-50'
                  }`}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Performance Section - Responsive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Performance Metrics */}
        <Card className="border-gray-200/80 shadow-sm">
          <CardHeader className="pb-2 px-3 sm:px-5 pt-3 sm:pt-5">
            <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
              <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
              <span className="truncate">Performance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-5 pb-3 sm:pb-5 space-y-2 sm:space-y-3">
            {performanceMetrics.map((metric) => (
              <div key={metric.label}>
                <div className="flex justify-between text-xs sm:text-sm mb-1">
                  <span className="text-gray-600 truncate">{metric.label}</span>
                  <span className="font-medium text-gray-900 flex-shrink-0">{metric.value}%</span>
                </div>
                <Progress value={metric.value} className={`h-1.5 sm:h-2 ${metric.color}`} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="border-gray-200/80 shadow-sm">
          <CardHeader className="pb-2 px-3 sm:px-5 pt-3 sm:pt-5">
            <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
              <Lightbulb className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
              <span className="truncate">Quick Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-4 lg:px-5 pb-3 sm:pb-5 space-y-2 sm:space-y-3">
            <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="p-1 bg-blue-100 rounded-full mt-0.5 flex-shrink-0">
                <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">Engage your audience</p>
                <p className="text-[10px] sm:text-xs text-gray-500 hidden xs:block">Send reminders and follow-ups to boost attendance by 40%</p>
                <p className="text-[10px] sm:text-xs text-gray-500 xs:hidden">Boost attendance by 40%</p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="p-1 bg-green-100 rounded-full mt-0.5 flex-shrink-0">
                <Award className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">Issue certificates early</p>
                <p className="text-[10px] sm:text-xs text-gray-500 hidden xs:block">92% of attendees value certificates within 48 hours</p>
                <p className="text-[10px] sm:text-xs text-gray-500 xs:hidden">92% value within 48 hours</p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-purple-50 rounded-lg border border-purple-100">
              <div className="p-1 bg-purple-100 rounded-full mt-0.5 flex-shrink-0">
                <Share2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">Share event replays</p>
                <p className="text-[10px] sm:text-xs text-gray-500 hidden xs:block">Replays generate 45% additional engagement post-event</p>
                <p className="text-[10px] sm:text-xs text-gray-500 xs:hidden">45% more engagement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}