function AuthPage({
  authStep,
  loginForm,
  signupForm,
  statusMessage,
  onLoginChange,
  onSignupChange,
  onLogin,
  onRequestOtp,
  onVerifyOtp,
  onCompleteSignup,
  onStepChange,
}) {
  return (
    <section className="auth-screen">
      <p className="eyebrow">Sorted</p>
      <h1>{authStep === 'login' ? 'Login' : authStep === 'signup-phone' ? 'Sign up' : 'Create account'}</h1>
      <p className="auth-copy">
        Login with phone number and 4-digit PIN. New users verify phone first, then set PIN, name,
        address, and optional email.
      </p>

      {authStep === 'login' ? (
        <div className="auth-card">
          <input
            name="phoneNumber"
            type="tel"
            placeholder="Phone number"
            value={loginForm.phoneNumber}
            onChange={onLoginChange}
          />
          <input
            name="pin"
            type="password"
            inputMode="numeric"
            maxLength="4"
            placeholder="4-digit PIN"
            value={loginForm.pin}
            onChange={onLoginChange}
          />
          <button className="primary-btn full" onClick={onLogin}>
            Login
          </button>
          <button className="text-btn" onClick={() => onStepChange('signup-phone')}>
            Sign up
          </button>
        </div>
      ) : null}

      {authStep === 'signup-phone' ? (
        <div className="auth-card">
          <input
            name="phoneNumber"
            type="tel"
            placeholder="Phone number"
            value={signupForm.phoneNumber}
            onChange={onSignupChange}
          />
          <button className="primary-btn full" onClick={onRequestOtp}>
            Request OTP
          </button>
          <button className="text-btn" onClick={() => onStepChange('login')}>
            Back to login
          </button>
        </div>
      ) : null}

      {authStep === 'signup-otp' ? (
        <div className="auth-card">
          <input
            name="otpCode"
            type="text"
            inputMode="numeric"
            maxLength="4"
            placeholder="Enter OTP"
            value={signupForm.otpCode}
            onChange={onSignupChange}
          />
          <button className="primary-btn full" onClick={onVerifyOtp}>
            Verify phone
          </button>
        </div>
      ) : null}

      {authStep === 'signup-profile' ? (
        <div className="auth-card">
          <input
            name="pin"
            type="password"
            inputMode="numeric"
            maxLength="4"
            placeholder="Set 4-digit PIN"
            value={signupForm.pin}
            onChange={onSignupChange}
          />
          <input name="name" type="text" placeholder="Full name" value={signupForm.name} onChange={onSignupChange} />
          <input
            name="address"
            type="text"
            placeholder="Address"
            value={signupForm.address}
            onChange={onSignupChange}
          />
          <input
            name="email"
            type="email"
            placeholder="Email (optional)"
            value={signupForm.email}
            onChange={onSignupChange}
          />
          <button className="primary-btn full" onClick={onCompleteSignup}>
            Finish signup
          </button>
        </div>
      ) : null}

      <p className="status-banner">{statusMessage}</p>
    </section>
  );
}

export default AuthPage;
