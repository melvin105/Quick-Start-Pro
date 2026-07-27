import StatCard from '../../../components/ui/StatCard'
import TodaysSchedule, { type ScheduleItem } from './TodaysSchedule'
import ActivityFeed, { type ActivityItem } from '../manager/ActivityFeed'

const SCHEDULE: ScheduleItem[] = [
  { time: '9:00',  initials: 'JM', name: 'John Mensah',   detail: 'Practical Lesson', status: 'confirmed' },
  { time: '10:00', initials: 'MO', name: 'Mary Owusu',    detail: 'Highway Driving',  status: 'confirmed' },
  { time: '11:00', initials: 'KB', name: 'Kwesi Boateng', detail: 'Theory Class',     status: 'pending' },
]

const ACTIVITY: ActivityItem[] = [
  { icon: 'student',    text: 'John Mensah registered',       time: '10 minutes ago' },
  { icon: 'payment',    text: 'Payment received — GHS 500',   time: '25 minutes ago' },
  { icon: 'attendance', text: 'Attendance updated',            time: '1 hour ago' },
]

export default function SecretaryDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Students" value="284" delta={{ text: '+18 this week', tone: 'positive' }} />
        <StatCard label="Today's Lessons" value="18" delta={{ text: '5 remaining', tone: 'neutral' }} />
        <StatCard label="Today's Payments" value="GHS 3,200" delta={{ text: '+GHS 800 vs yesterday', tone: 'positive' }} />
        <StatCard label="Outstanding" value="GHS 12,450" delta={{ text: '15 students owing', tone: 'warning' }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TodaysSchedule items={SCHEDULE} />
        <ActivityFeed items={ACTIVITY} />
      </div>
    </div>
  )
}
