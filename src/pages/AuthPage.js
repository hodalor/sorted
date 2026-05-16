import LoadingDots from '../components/LoadingDots';

function AuthPage({
  authStep,
  countryOptions,
  otpProvider,
  loginForm,
  signupForm,
  authLoading,
  otpCooldown,
  recaptchaRenderKey,
  showRecaptcha,
  statusMessage,
  onResendOtp,
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
            {authLoading.login ? (
              <span className="button-content">
                <LoadingDots />
                <span>Logging in</span>
              </span>
            ) : (
              'Login'
            )}
          </button>
          <button className="text-btn" onClick={() => onStepChange('signup-phone')}>
            Sign up
          </button>
        </div>
      ) : null}

      {authStep === 'signup-phone' ? (
        <div className="auth-card">
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
            {authLoading.requestOtp ? (
              <span className="button-content">
                <LoadingDots />
                <span>{otpProvider === 'firebase' ? 'Waiting for reCAPTCHA' : 'Generating OTP'}</span>
              </span>
            ) : (
              'Request OTP'
            )}
          </button>
          <button className="text-btn" onClick={() => onStepChange('login')}>
            Back to login
          </button>
        </div>
      ) : null}

      {authStep === 'signup-otp' ? (
        <div className="auth-card">
          <button className="text-btn inline-back" onClick={() => onStepChange('signup-phone')}>
            Back
          </button>
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
            {authLoading.verifyOtp ? (
              <span className="button-content">
                <LoadingDots />
                <span>Verifying phone</span>
              </span>
            ) : (
              'Verify phone'
            )}
          </button>
          <button
            className="ghost-btn full"
            onClick={onResendOtp}
            disabled={authLoading.requestOtp || otpCooldown > 0}>
            {authLoading.requestOtp ? (
              <span className="button-content">
                <LoadingDots />
                <span>{otpProvider === 'firebase' ? 'Waiting for reCAPTCHA' : 'Generating OTP'}</span>
              </span>
            ) : otpCooldown > 0 ? (
              `Resend OTP in ${otpCooldown}s`
            ) : (
              'Resend OTP'
            )}
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
            {authLoading.completeSignup ? (
              <span className="button-content">
                <LoadingDots />
                <span>Finishing signup</span>
              </span>
            ) : (
              'Finish signup'
            )}
          </button>
        </div>
      ) : null}

      {statusMessage ? <p className="status-banner">{statusMessage}</p> : null}
    </section>
  );
}

export default AuthPage;
