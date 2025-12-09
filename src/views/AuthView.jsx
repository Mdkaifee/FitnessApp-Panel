import { useRef } from 'react'

function AuthView({
  authStep,
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
  onBackToLogin,
}) {
  const otpInputRef = useRef(null)
  const otpDigits = Array.from({ length: 6 }, (_, index) => otp[index] ?? '')
  const cursorPosition = Math.min(otp.length, 5) // Ensure cursor stays within visible boxes

  return (
    <section className="auth-board">
      <div className="auth-board__left">
        <div className="auth-brand">
          <div className="brand-icon">SS</div>
          <p>Fitness Cassie Admin</p>
        </div>
        <div className="auth-copy">
          <h1>Secure OTP access</h1>
          <p>Trigger OTP logins, verify sessions, and monitor profile completion in one place.</p>
        </div>
      </div>
      <div className="auth-board__form">
        {authStep === 'login' ? (
          <>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                autoComplete="email"
                onChange={(event) => onEmailChange(event.target.value)}
              />
            </label>
            <button onClick={onRequestOtp} disabled={!trimmedEmail || pendingAction === 'request'}>
              {pendingAction === 'request' ? 'Sending…' : 'Login'}
            </button>
          </>
        ) : (
          <>
            <p className="otp-instructions">
              We sent a 6-digit code to <strong>{email}</strong>
              <button type="button" className="link-button" onClick={onBackToLogin}>
                Change email
              </button>
            </p>
            <div className="otp-box-wrapper" onClick={() => otpInputRef.current?.focus()}>
              <div className="otp-boxes">
                {otpDigits.map((digit, index) => (
                  <span key={index} className={`otp-box ${digit ? 'filled' : ''} ${index === cursorPosition ? 'cursor' : ''}`}>
                    {digit || (index === cursorPosition ? '|' : '')}
                  </span>
                ))}
              </div>
              <input
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                className="otp-hidden-input"
                value={otp}
                onChange={(event) => onOtpChange(event.target.value)}
                maxLength={6}
              />
            </div>
            <button
              className="primary"
              onClick={onVerifyOtp}
              disabled={!trimmedEmail || otp.length < 6 || pendingAction === 'verify'}
            >
              {pendingAction === 'verify' ? 'Verifying…' : 'Verify & Login'}
            </button>
            <button
              className="secondary"
              onClick={onResendOtp}
              disabled={!hasRequestedOtp || resendSeconds > 0 || pendingAction === 'resend'}
            >
              {resendSeconds > 0
                ? `Resend in ${String(Math.floor(resendSeconds / 60)).padStart(2, '0')}:${String(resendSeconds % 60).padStart(2, '0')}`
                : 'Resend OTP'}
            </button>
          </>
        )}
        {/* {flowHint && (
          <p className="hint">
            Flow detected: <span className="pill neutral">{flowHint}</span>
          </p>
        )} */}
      </div>
    </section>
  )
}

export default AuthView
