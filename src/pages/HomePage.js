import LoadingDots from '../components/LoadingDots';

const toneMap = ['gold', 'amber', 'blue', 'green', 'sky', 'lime'];

function HomePage({ session, search, categories, providers, bookingProviderId, onSearchChange, onBook }) {
  return (
    <>
      <section className="hero-card sticky-hero">
        <div className="hero-top">
          <div>
            <p className="eyebrow">{session.user.phoneNumber}</p>
            <h1>What do you need?</h1>
          </div>
          <div className="avatar">{session.user.name.slice(0, 2).toUpperCase()}</div>
        </div>

        <label className="search-bar" htmlFor="service-search">
          <span>Search a service...</span>
          <input
            id="service-search"
            type="text"
            placeholder="Mechanic, cleaner, barber..."
            value={search}
            onChange={onSearchChange}
          />
        </label>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Services</p>
          <h2>Browse categories</h2>
        </div>
        {categories.length ? (
          <div className="category-grid compact-grid">
            {categories.map((category, index) => (
              <article className={`category-card compact-card ${toneMap[index % toneMap.length]}`} key={category.name}>
                <div className="category-icon">{category.name.slice(0, 1)}</div>
                <strong>{category.name}</strong>
                <span>{category.available} available</span>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">No categories yet. Create them in admin settings.</div>
        )}
      </section>

      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Providers</p>
          <h2>Approved providers</h2>
        </div>
        {providers.length ? (
          <div className="provider-list">
            {providers.map((provider) => {
              const providerId = provider.id || provider._id;
              const isBooking = bookingProviderId === providerId;

              return (
                <article className="provider-card compact-card" key={providerId}>
                  <div className="provider-head">
                    <div>
                      <strong>{provider.businessName || provider.name}</strong>
                      <p>{provider.category}</p>
                    </div>
                    <div className="provider-rating">{provider.rating || '0.0'}</div>
                  </div>
                  <p className="provider-review">{provider.bio || 'No provider description yet.'}</p>
                  <div className="provider-footer">
                    <span>${provider.rate}/hr</span>
                    <button
                      className="ghost-btn small"
                      onClick={() => onBook(provider)}
                      disabled={isBooking || !provider.serviceId}>
                      {isBooking ? (
                        <span className="button-content">
                          <LoadingDots />
                          <span>Booking</span>
                        </span>
                      ) : (
                        'Book now'
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">No approved providers yet.</div>
        )}
      </section>
    </>
  );
}

export default HomePage;
