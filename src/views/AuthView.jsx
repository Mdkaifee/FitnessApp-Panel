import { useEffect, useRef, useState } from 'react'

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
  const [termsAccepted, setTermsAccepted] = useState(false)
  const formatResendTime = () => {
    const minutes = Math.floor(resendSeconds / 60)
    const seconds = resendSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  useEffect(() => {
    if (authStep === 'login') {
      setTermsAccepted(false)
    }
  }, [authStep])

  return (
    <section className="auth-hero">
      <div className="login-card">
        <div className="login-card__media">
          <img src="/loginimg.png" alt="Workout session" />
          <div className="login-card__media-gradient" />
        </div>
        <div className="login-card__content">
          <div className="login-card__logo">
            <img src="/splash text.png" alt="Simple Starts" />
          </div>
          <div className="login-card__intro">
            <h2>{authStep === 'login' ? 'Log In' : 'Verify OTP'}</h2>
            <p>{authStep === 'login' ? 'Access your fitness dashboard securely' : "We've sent a 6-digit OTP to your email"}</p>
          </div>
          {authStep === 'login' ? (
            <div className="login-form">
              <label className="login-field">
                <span>Email</span>
                <input
                  type="email"
                  placeholder="e.g., user@gmail.com"
                  value={email}
                  autoComplete="email"
                  onChange={(event) => onEmailChange(event.target.value)}
                />
              </label>
              <label className="login-terms">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(event) => setTermsAccepted(event.target.checked)}
                />
                <span>
                  I agree to the{' '}
                  <a href="https://www.simplestartsco.com/policies/terms-of-service" target="_blank" rel="noreferrer">
                    Terms & Conditions
                  </a>{' '}
                  and{' '}
                  <a href="https://www.simplestartsco.com/policies/privacy-policy" target="_blank" rel="noreferrer">
                    Privacy Policy
                  </a>
                </span>
              </label>
              <button
                className="login-button"
                onClick={onRequestOtp}
                disabled={!trimmedEmail || pendingAction === 'request' || !termsAccepted}
              >
                {pendingAction === 'request' ? 'Sending…' : 'Send OTP'}
              </button>
            </div>
          ) : (
            <div className="otp-panel">
              <label className="otp-label">Enter OTP</label>
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
                className="login-button"
                onClick={onVerifyOtp}
                disabled={!trimmedEmail || otp.length < 6 || pendingAction === 'verify'}
              >
                {pendingAction === 'verify' ? 'Verifying…' : 'Verify & Login'}
              </button>
              <div className="otp-actions">
                <button
                  className="resend-link"
                  onClick={onResendOtp}
                  disabled={!hasRequestedOtp || resendSeconds > 0 || pendingAction === 'resend'}
                >
                  {resendSeconds > 0 ? `Resend OTP (${formatResendTime()})` : 'Resend OTP'}
                </button>
              </div>
              <button type="button" className="change-email-button" onClick={onBackToLogin}>
                Change Email
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default AuthView
