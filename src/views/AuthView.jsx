import { useEffect, useRef, useState } from 'react'

const OTP_LENGTH = 6

function AuthView({
  authStep,
  email,
  otpDigits,
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
  const otpInputRefs = useRef([])
  const otpDigitsRef = useRef(otpDigits)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const isOtpComplete = otpDigits.every((digit) => digit && digit.length > 0)

  useEffect(() => {
    otpDigitsRef.current = otpDigits
  }, [otpDigits])

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

  useEffect(() => {
    if (authStep !== 'otp') return
    const digits = otpDigitsRef.current
    const emptyIndex = digits.findIndex((digit) => !digit)
    const targetIndex = emptyIndex === -1 ? OTP_LENGTH - 1 : emptyIndex
    const targetInput = otpInputRefs.current[targetIndex]
    targetInput?.focus()
    targetInput?.select()
  }, [authStep])

  const focusDigitAt = (index) => {
    const clampedIndex = Math.max(0, Math.min(index, OTP_LENGTH - 1))
    const input = otpInputRefs.current[clampedIndex]
    if (input) {
      input.focus()
      input.select()
    }
  }

  const focusFirstEmptyDigit = () => {
    const emptyIndex = otpDigits.findIndex((digit) => !digit)
    const targetIndex = emptyIndex === -1 ? OTP_LENGTH - 1 : emptyIndex
    focusDigitAt(targetIndex)
  }

  const applyDigitSequence = (startIndex, sequence) => {
    if (!sequence) return
    const sanitizedSequence = sequence.replace(/\D/g, '')
    if (!sanitizedSequence) return
    const nextDigits = [...otpDigits]
    let cursor = Math.max(0, Math.min(startIndex, OTP_LENGTH - 1))
    for (const char of sanitizedSequence) {
      if (cursor >= OTP_LENGTH) break
      nextDigits[cursor] = char
      cursor += 1
    }
    onOtpChange(nextDigits)
    if (cursor < OTP_LENGTH) {
      focusDigitAt(cursor)
    }
  }

  const handleOtpDigitChange = (index, rawValue) => {
    const sanitized = rawValue.replace(/\D/g, '')
    if (!sanitized) {
      const nextDigits = [...otpDigits]
      nextDigits[index] = ''
      onOtpChange(nextDigits)
      return
    }
    applyDigitSequence(index, sanitized)
  }

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
      event.preventDefault()
      if (otpDigits[index]) {
        const nextDigits = [...otpDigits]
        nextDigits[index] = ''
        onOtpChange(nextDigits)
      } else if (index > 0) {
        focusDigitAt(index - 1)
        const nextDigits = [...otpDigits]
        nextDigits[index - 1] = ''
        onOtpChange(nextDigits)
      }
      return
    }
    if (event.key === 'Delete') {
      event.preventDefault()
      if (otpDigits[index]) {
        const nextDigits = [...otpDigits]
        nextDigits[index] = ''
        onOtpChange(nextDigits)
      }
      return
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusDigitAt(index - 1)
      return
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusDigitAt(index + 1)
      return
    }
    if (event.key === 'Enter') {
      if (trimmedEmail && isOtpComplete && pendingAction !== 'verify') {
        event.preventDefault()
        onVerifyOtp()
      }
    }
  }

  const handleOtpPaste = (event) => {
    if (authStep !== 'otp') return
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '')
    if (!pasted) return
    const activeElement = document.activeElement
    const activeIndex = otpInputRefs.current.findIndex((input) => input === activeElement)
    const startIndex = activeIndex === -1 ? 0 : activeIndex
    applyDigitSequence(startIndex, pasted)
  }

  const handleOtpWrapperClick = (event) => {
    if (event.target === event.currentTarget) {
      focusFirstEmptyDigit()
    }
  }

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
              <div className="otp-box-wrapper" onClick={handleOtpWrapperClick} onPaste={handleOtpPaste}>
                <div className="otp-boxes">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        otpInputRefs.current[index] = element
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={1}
                      className={`otp-digit-input${digit ? ' filled' : ''}`}
                      value={digit}
                      onChange={(event) => handleOtpDigitChange(index, event.target.value)}
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      onFocus={(event) => event.target.select()}
                      autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    />
                  ))}
                </div>
              </div>
              <button
                className="login-button"
                onClick={onVerifyOtp}
                disabled={!trimmedEmail || !isOtpComplete || pendingAction === 'verify'}
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
              {/* <button type="button" className="change-email-button" onClick={onBackToLogin}>
                Change Email
              </button> */}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default AuthView
