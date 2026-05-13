const toneMap = ['gold', 'amber', 'blue', 'green', 'sky', 'lime'];

function HomePage({ session, search, categories, providers, onSearchChange, onBook }) {
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
        <div className="category-grid compact-grid">
          {categories.map((category, index) => (
            <article className={`category-card compact-card ${toneMap[index % toneMap.length]}`} key={category.name}>
              <div className="category-icon">{category.name.slice(0, 1)}</div>
              <strong>{category.name}</strong>
              <span>{category.available} available</span>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Providers</p>
          <h2>Approved providers</h2>
        </div>
        <div className="provider-list">
          {providers.map((provider) => (
            <article className="provider-card compact-card" key={provider._id || provider.id}>
              <div className="provider-head">
                <div>
                  <strong>{provider.businessName || provider.name}</strong>
                  <p>{provider.category}</p>
                </div>
                <div className="provider-rating">{provider.rating}</div>
              </div>
              <p className="provider-review">{provider.bio}</p>
              <div className="provider-footer">
                <span>${provider.rate}/hr</span>
                <button className="ghost-btn small" onClick={() => onBook(provider)}>
                  Book now
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default HomePage;
