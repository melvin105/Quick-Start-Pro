import type { NotificationView } from './notificationMappers'

// One notification line, shared by the topbar panel and the Notifications page.
// Unread rows carry a faint brand tint and a dot; clicking marks read and (if
// the notification has one) follows its link — the parent decides both.
export default function NotificationRow({ view, onClick }: { view: NotificationView; onClick: () => void }) {
  const Icon = view.icon
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex gap-3 px-2 py-3 text-left rounded-lg transition-colors hover:bg-gray-50 ${
        view.isRead ? '' : 'bg-brand-50/40'
      }`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${view.accent}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-900">{view.title}</p>
        {view.body && <p className="text-[12px] text-gray-600 mt-0.5">{view.body}</p>}
        {view.linkUrl && <p className="text-[12px] font-semibold text-brand-600 mt-1">View →</p>}
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className="text-[11px] text-gray-400 whitespace-nowrap">{view.timeLabel}</span>
        {!view.isRead && <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />}
      </div>
    </button>
  )
}
