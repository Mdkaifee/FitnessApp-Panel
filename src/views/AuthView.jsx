function AuthView({
  email,
  otp,
  flowHint,
  trimmedEmail,
  pendingAction,
  hasRequestedOtp,
  resendSeconds,
  onEmailChange,
  onRequestOtp,
  onResendOtp,
  onVerifyOtp,
  onOtpChange,
}) {
  return (
    <section className="auth-board">
      <div className="auth-board__left">
        <div className="auth-brand">
          <div className="brand-icon">FC</div>
          <p>Fitness Cassie Admin</p>
        </div>
        <div className="auth-copy">
          <h1>Secure OTP access</h1>
          <p>Trigger OTP logins, verify sessions, and monitor profile completion in one place.</p>
        </div>
      </div>
      <div className="auth-board__form">
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            placeholder="user@example.com"
            value={email}
            autoComplete="email"
            onChange={(event) => onEmailChange(event.target.value)}
          />
        </label>
        <div className="button-row">
          <button onClick={onRequestOtp} disabled={!trimmedEmail || pendingAction === 'request'}>
            {pendingAction === 'request' ? 'Sending...' : 'Send OTP'}
          </button>
          <button
            className="secondary"
            onClick={onResendOtp}
            disabled={
              !hasRequestedOtp || resendSeconds > 0 || pendingAction === 'resend' || !trimmedEmail
            }
          >
            {resendSeconds > 0
              ? `Resend OTP in ${String(Math.floor(resendSeconds / 60)).padStart(2, '0')}:${String(resendSeconds % 60).padStart(2, '0')}`
              : 'Resend OTP'}
          </button>
        </div>
        <label className="field">
          <span>One-Time Password</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="6-digit code"
            value={otp}
            onChange={(event) => onOtpChange(event.target.value)}
            maxLength={6}
          />
        </label>
        <button
          className="primary"
          onClick={onVerifyOtp}
          disabled={!trimmedEmail || otp.length < 6 || pendingAction === 'verify'}
        >
          {pendingAction === 'verify' ? 'Verifying...' : 'Verify & Login'}
        </button>
        {flowHint && (
          <p className="hint">
            Flow detected: <span className="pill neutral">{flowHint}</span>
          </p>
        )}
      </div>
    </section>
  )
}

export default AuthView
