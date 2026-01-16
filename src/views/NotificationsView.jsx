const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'All users' },
  { value: 'active', label: 'Active users' },
  { value: 'inactive', label: 'Inactive users' },
  { value: 'purchased_plan', label: 'Purchased plan' },
  { value: 'pilates_board', label: 'Pilates board owners' },
  { value: 'emails', label: 'Specific emails' },
  { value: 'user_ids', label: 'Specific user IDs' },
]

function NotificationsView({ form, onChange, onSubmit, pending }) {
  const isEmailAudience = form.audience === 'emails'
  const isUserIdAudience = form.audience === 'user_ids'

  return (
    <div className="panel notifications-panel">
      <div className="panel-header">
      </div>

      <form
        className="video-form"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <div className="video-form__grid">
          <label>
            Title
            <input
              type="text"
              value={form.title}
              onChange={(event) => onChange({ title: event.target.value })}
              placeholder="New program is live"
              required
            />
          </label>
          <label>
            Audience
            <select
              value={form.audience}
              onChange={(event) => onChange({ audience: event.target.value })}
            >
              {AUDIENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Message
          <textarea
            value={form.body}
            onChange={(event) => onChange({ body: event.target.value })}
            placeholder="Tell members about your latest update, sale, or program."
            rows={4}
            required
          />
        </label>

        {isEmailAudience && (
          <label>
            Emails
            <input
              type="text"
              value={form.emails}
              onChange={(event) => onChange({ emails: event.target.value })}
              placeholder="name@example.com, name2@example.com"
              required
            />
          </label>
        )}

        {isUserIdAudience && (
          <label>
            User IDs
            <input
              type="text"
              value={form.userIds}
              onChange={(event) => onChange({ userIds: event.target.value })}
              placeholder="12, 54, 89"
              required
            />
          </label>
        )}

        <div className="video-form__actions">
          <button type="submit" className="theme-button" disabled={pending}>
            {pending ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NotificationsView
