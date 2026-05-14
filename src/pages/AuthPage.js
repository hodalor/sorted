function AuthPage({
  authStep,
  countryOptions,
  otpProvider,
  loginForm,
  signupForm,
  authLoading,
  recaptchaRenderKey,
  showRecaptcha,
  statusMessage,
  onLoginChange,
  onSignupChange,
  onLogin,
  onRequestOtp,
  onVerifyOtp,
  onCompleteSignup,
  onStepChange,
}) {
  const otpLength = otpProvider === 'firebase' ? 6 : 4;

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
              {countryOptions.map((country) => (
                <option key={`${country.code}-${country.dialingCode}`} value={country.dialingCode}>
                  {country.dialingCode}
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
          <p className="auth-hint">
            {otpProvider === 'system'
              ? 'Request OTP to generate a system code and verify it before entering your profile details.'
              : 'Request OTP to load reCAPTCHA, then complete it to receive the Firebase SMS code.'}
          </p>
          <div className="phone-input-row">
            <select name="countryCode" value={signupForm.countryCode} onChange={onSignupChange}>
              {countryOptions.map((country) => (
                <option key={`${country.code}-${country.dialingCode}`} value={country.dialingCode}>
                  {country.dialingCode}
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
          {otpProvider === 'firebase' && showRecaptcha ? (
            <div key={recaptchaRenderKey} id="firebase-recaptcha" className="firebase-recaptcha" />
          ) : null}
          <button className="primary-btn full" onClick={onRequestOtp} disabled={authLoading.requestOtp}>
            {authLoading.requestOtp
              ? otpProvider === 'firebase'
                ? 'Waiting for reCAPTCHA...'
                : 'Generating OTP...'
              : 'Request OTP'}
          </button>
          <button className="text-btn" onClick={() => onStepChange('login')}>
            Back to login
          </button>
        </div>
      ) : null}

      {authStep === 'signup-otp' ? (
        <div className="auth-card">
          <p className="auth-hint">
            {otpProvider === 'system'
              ? 'Enter the system-generated OTP shown on the screen.'
              : 'Enter the SMS code sent by Firebase.'}
          </p>
          <input
            name="otpCode"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={otpLength}
            placeholder={`Enter ${otpLength}-digit OTP`}
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
