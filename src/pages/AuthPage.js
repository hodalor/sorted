function AuthPage({
  authStep,
  countryCodeOptions,
  loginForm,
  signupForm,
  authLoading,
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
          <div className="phone-input-row">
            <select name="countryCode" value={loginForm.countryCode} onChange={onLoginChange}>
              {countryCodeOptions.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
            <input
              name="phoneNumber"
              type="tel"
              placeholder="Phone number"
              value={loginForm.phoneNumber}
              onChange={onLoginChange}
            />
          </div>
          <input
            name="pin"
            type="password"
            inputMode="numeric"
            maxLength="4"
            placeholder="4-digit PIN"
            value={loginForm.pin}
            onChange={onLoginChange}
          />
          <button className="primary-btn full" onClick={onLogin} disabled={authLoading.login}>
            {authLoading.login ? 'Logging in...' : 'Login'}
          </button>
          <button className="text-btn" onClick={() => onStepChange('signup-phone')}>
            Sign up
          </button>
        </div>
      ) : null}

      {authStep === 'signup-phone' ? (
        <div className="auth-card">
          <p className="auth-hint">Firebase will text a verification code to this number.</p>
          <div className="phone-input-row">
            <select name="countryCode" value={signupForm.countryCode} onChange={onSignupChange}>
              {countryCodeOptions.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
            <input
              name="phoneNumber"
              type="tel"
              placeholder="Phone number"
              value={signupForm.phoneNumber}
              onChange={onSignupChange}
            />
          </div>
          <div id="firebase-recaptcha" className="firebase-recaptcha" />
          <button className="primary-btn full" onClick={onRequestOtp} disabled={authLoading.requestOtp}>
            {authLoading.requestOtp ? 'Requesting OTP...' : 'Request OTP'}
          </button>
          <button className="text-btn" onClick={() => onStepChange('login')}>
            Back to login
          </button>
        </div>
      ) : null}

      {authStep === 'signup-otp' ? (
        <div className="auth-card">
          <p className="auth-hint">Enter the SMS code sent by Firebase.</p>
          <input
            name="otpCode"
            type="text"
            inputMode="numeric"
            maxLength="4"
            placeholder="Enter OTP"
            value={signupForm.otpCode}
            onChange={onSignupChange}
          />
          <button className="primary-btn full" onClick={onVerifyOtp} disabled={authLoading.verifyOtp}>
            {authLoading.verifyOtp ? 'Verifying...' : 'Verify phone'}
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
          <button className="primary-btn full" onClick={onCompleteSignup} disabled={authLoading.completeSignup}>
            {authLoading.completeSignup ? 'Finishing signup...' : 'Finish signup'}
          </button>
        </div>
      ) : null}

      <p className="status-banner">{statusMessage}</p>
    </section>
  );
}

export default AuthPage;
