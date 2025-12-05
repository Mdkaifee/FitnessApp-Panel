const DELETE_META = [
  { label: 'Processing window', value: '1–7 business days' },
  { label: 'Grace period', value: '72 hours to undo the request' },
  { label: 'Full purge', value: '30 days after confirmation' },
]

const DELETE_CHANNELS = [
  {
    title: 'In-app request',
    subtitle: 'Settings → Account → Delete account',
    badge: 'Fastest',
    steps: [
      'Open the Fitness Cassie mobile app from the account you want to close.',
      'Navigate to Settings, tap Delete account, and confirm with the OTP sent to your email.',
      'Once verified, the account locks instantly and enters the removal queue.',
    ],
  },
  {
    title: 'Support ticket',
    subtitle: 'support@fitnesscassie.com',
    badge: 'Assisted',
    steps: [
      'Email us using the address tied to the membership with subject “Account deletion”.',
      'Include a short statement authorizing deletion plus any invoices needed for audit.',
      'Support confirms identity, cancels billing, and schedules the deletion batch.',
    ],
  },
  {
    title: 'Enterprise coordinator',
    subtitle: 'Customer success manager',
    badge: 'Team accounts',
    steps: [
      'Reach out to your success manager to remove multiple seats or bulk devices.',
      'Receive an export of training history if requested by your organization.',
      'Sign the offboarding acknowledgement so we can close out related services.',
    ],
  },
]

const POST_DELETION = [
  'All sessions are revoked immediately after the final confirmation—users can no longer log in.',
  'Recurring subscriptions are cancelled, but outstanding invoices still appear on your ledger.',
  'Workout analytics remain in aggregate form only; nothing is traceable to the deleted member.',
]

function DeleteAccountView() {
  return (
    <div className="panel delete-panel">
      <div className="panel-header">
        <div>
          <h2>Delete Account</h2>
          <p>Follow these steps when a member asks to permanently remove their Fitness Cassie data.</p>
        </div>
        <span className="pill neutral">Irreversible action</span>
      </div>
      <dl className="delete-meta">
        {DELETE_META.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
      <div className="delete-grid">
        {DELETE_CHANNELS.map((channel) => (
          <article className="delete-card" key={channel.title}>
            <div className="delete-card__header">
              <div>
                <h3>{channel.title}</h3>
                <p>{channel.subtitle}</p>
              </div>
              <span className="pill neutral">{channel.badge}</span>
            </div>
            <ol className="steps-list">
              {channel.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>
        ))}
      </div>
      <div className="delete-safeguards">
        <h3>What happens after deletion?</h3>
        <ul>
          {POST_DELETION.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          To escalate a legal or urgent removal, contact{' '}
          <a href="mailto:support@fitnesscassie.com">support@fitnesscassie.com</a> with the account
          email and any order numbers tied to the request.
        </p>
      </div>
    </div>
  )
}

export default DeleteAccountView
