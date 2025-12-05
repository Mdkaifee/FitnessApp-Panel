const POLICY_META = [
  { label: 'Last updated', value: '12 Feb 2025' },
  { label: 'Data retention', value: 'Active account + 30 days' },
  { label: 'Storage', value: 'Encrypted U.S. cloud region' },
  { label: 'Data sharing', value: 'Never sold; vendors under NDA' },
]

const POLICY_SECTIONS = [
  {
    title: 'Information we collect',
    description:
      'Fitness Cassie stores only the details you share in the mobile app or through customer support.',
    points: [
      'Contact information such as name, email, phone number, and date of birth.',
      'Program activity data (completed workouts, check-ins, progress photos, and notes).',
      'Subscription metadata supplied by Apple / Google for billing and fraud prevention.',
    ],
  },
  {
    title: 'How we use your information',
    description:
      'Your data powers personalized programming while keeping the admin workspace secure.',
    points: [
      'Tailor training plans, reminders, and recommendations based on your progress.',
      'Track account health so coaches can intervene when members stall.',
      'Detect suspicious sign-ins and comply with legal retention requirements.',
    ],
  },
  {
    title: 'Your privacy rights',
    description:
      'We respond to access, export, and deletion requests within statutory timelines.',
    points: [
      'View or update your profile anytime inside the Fitness Cassie app.',
      'Request a full data export by emailing support@fitnesscassie.com.',
      'Close your account through the Delete Account route for immediate revocation.',
    ],
  },
  {
    title: 'Third-party sharing',
    description:
      'Limited vendors help us operate the service, but they never own your personal data.',
    points: [
      'Analytics and storage vendors receive only anonymized or encrypted identifiers.',
      'Payment processors get the details required to manage purchases and refunds.',
      'Operational support staff sign confidentiality agreements before accessing records.',
    ],
  },
]

function PrivacyPolicyView() {
  return (
    <div className="panel policy-panel">
      <div className="panel-header">
        <div>
          <h2>Privacy Policy</h2>
          <p>Understand how Fitness Cassie handles member information inside the admin workspace.</p>
        </div>
        <span className="pill neutral">GDPR & CCPA ready</span>
      </div>
      <dl className="policy-meta">
        {POLICY_META.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
      <div className="policy-grid">
        {POLICY_SECTIONS.map((section) => (
          <article className="policy-card" key={section.title}>
            <h3>{section.title}</h3>
            <p>{section.description}</p>
            <ul>
              {section.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className="policy-contact">
        <h3>Need help with data privacy?</h3>
        <p>
          Email <a href="mailto:support@fitnesscassie.com">support@fitnesscassie.com</a> or open a
          ticket from the mobile app to access, export, or erase data tied to an account.
        </p>
        <p>
          For urgent escalations, reference the Remove Account instructions below so our ops team
          can prioritize the request.
        </p>
      </div>
    </div>
  )
}

export default PrivacyPolicyView
