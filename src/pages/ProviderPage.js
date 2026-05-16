import LoadingDots from '../components/LoadingDots';

function ProviderPage({
  session,
  categories,
  providerForm,
  providerAccount,
  providerEditor,
  actionLoading,
  onProviderChange,
  onProviderEditorChange,
  onSubmitProvider,
  onSaveProviderSettings,
  onBookingAction,
}) {
  return (
    <section className="section-block">
      <div className="section-heading">
        <p className="eyebrow">Provide Service</p>
        <h2>{session.user.providerProfile ? 'Provider account' : 'Become service provider'}</h2>
      </div>

      {!session.user.providerProfile ? (
        <div className="provider-onboarding">
          <input
            name="businessName"
            type="text"
            placeholder="Business name"
            value={providerForm.businessName}
            onChange={onProviderChange}
          />
          <select name="isRegisteredBusiness" value={providerForm.isRegisteredBusiness} onChange={onProviderChange}>
            <option value="no">Not registered</option>
            <option value="yes">Registered</option>
          </select>
          {providerForm.isRegisteredBusiness === 'yes' ? (
            <input
              name="registrationNumber"
              type="text"
              placeholder="Registration number"
              value={providerForm.registrationNumber}
              onChange={onProviderChange}
            />
          ) : null}
          <select name="category" value={providerForm.category} onChange={onProviderChange}>
            {categories.length ? (
              categories.map((category) => (
                <option key={category._id || category.id || category.name} value={category.name}>
                  {category.name}
                </option>
              ))
            ) : (
              <option value="">No categories available</option>
            )}
          </select>
          <input
            name="serviceTitle"
            type="text"
            placeholder="Service title"
            value={providerForm.serviceTitle}
            onChange={onProviderChange}
          />
          <input name="city" type="text" placeholder="City" value={providerForm.city} onChange={onProviderChange} />
          <input name="rate" type="number" placeholder="Rate" value={providerForm.rate} onChange={onProviderChange} />
          <textarea
            name="bio"
            placeholder="Short description"
            value={providerForm.bio}
            onChange={onProviderChange}
          />
          <input
            name="profilePictureUrl"
            type="text"
            placeholder="Profile photo URL"
            value={providerForm.profilePictureUrl}
            onChange={onProviderChange}
          />
          <input
            name="workPhotoOne"
            type="text"
            placeholder="Work photo 1 URL"
            value={providerForm.workPhotoOne}
            onChange={onProviderChange}
          />
          <input
            name="workPhotoTwo"
            type="text"
            placeholder="Work photo 2 URL"
            value={providerForm.workPhotoTwo}
            onChange={onProviderChange}
          />
          <input
            name="workPhotoThree"
            type="text"
            placeholder="Work photo 3 URL"
            value={providerForm.workPhotoThree}
            onChange={onProviderChange}
          />
          <input
            name="availability"
            type="text"
            placeholder="Availability list"
            value={providerForm.availability}
            onChange={onProviderChange}
          />
          <button
            className="primary-btn full"
            onClick={onSubmitProvider}
            disabled={actionLoading.submitProvider || !categories.length}>
            {actionLoading.submitProvider ? (
              <span className="button-content">
                <LoadingDots />
                <span>Submitting KYC</span>
              </span>
            ) : (
              'Submit KYC'
            )}
          </button>
          {!categories.length ? <div className="empty-state">Create categories in admin before provider onboarding.</div> : null}
        </div>
      ) : null}

      {session.user.providerProfile?.status === 'pending' ? (
        <div className="provider-panel">
          <strong>KYC pending</strong>
          <p>Provider submissions remain pending until admin approves them.</p>
        </div>
      ) : null}

      {providerAccount?.provider?.status === 'approved' ? (
        <div className="provider-panel">
          <div className="provider-panel-header">
            <div>
              <p className="eyebrow">Approved</p>
              <h3>{providerAccount.provider.businessName}</h3>
            </div>
            <span className="pill approved">approved</span>
          </div>

          <div className="provider-onboarding compact">
            <input
              name="serviceTitle"
              type="text"
              placeholder="Service title"
              value={providerEditor.serviceTitle}
              onChange={onProviderEditorChange}
            />
            <input name="rate" type="number" placeholder="Rate" value={providerEditor.rate} onChange={onProviderEditorChange} />
            <input
              name="availability"
              type="text"
              placeholder="Availability"
              value={providerEditor.availability}
              onChange={onProviderEditorChange}
            />
            <textarea name="bio" placeholder="Description" value={providerEditor.bio} onChange={onProviderEditorChange} />
            <button
              className="primary-btn full"
              onClick={onSaveProviderSettings}
              disabled={actionLoading.saveProviderSettings}>
              {actionLoading.saveProviderSettings ? (
                <span className="button-content">
                  <LoadingDots />
                  <span>Saving settings</span>
                </span>
              ) : (
                'Save provider settings'
              )}
            </button>
          </div>

          {(providerAccount.bookings || []).length ? (
            <div className="provider-booking-stack">
              {(providerAccount.bookings || []).map((booking) => {
                const bookingId = booking._id || booking.id;
                const confirming = actionLoading.providerBookingKey === `${bookingId}-confirmed`;
                const rejecting = actionLoading.providerBookingKey === `${bookingId}-cancelled`;

                return (
                  <div className="provider-booking-card" key={bookingId}>
                    <div>
                      <strong>{booking.serviceTitle}</strong>
                      <p>
                        {booking.seekerName} • {booking.date} • {booking.time}
                      </p>
                    </div>
                    <div className="provider-booking-actions">
                      <span className={`pill ${booking.status}`}>{booking.status}</span>
                      <button
                        className="ghost-btn small"
                        onClick={() => onBookingAction(bookingId, 'confirmed')}
                        disabled={confirming || rejecting}>
                        {confirming ? (
                          <span className="button-content">
                            <LoadingDots />
                            <span>Accepting</span>
                          </span>
                        ) : (
                          'Accept'
                        )}
                      </button>
                      <button
                        className="ghost-btn small"
                        onClick={() => onBookingAction(bookingId, 'cancelled')}
                        disabled={confirming || rejecting}>
                        {rejecting ? (
                          <span className="button-content">
                            <LoadingDots />
                            <span>Rejecting</span>
                          </span>
                        ) : (
                          'Reject'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">No provider bookings yet.</div>
          )}
        </div>
      ) : null}
    </section>
  );
}

export default ProviderPage;
