function ReviewsPage({ reviews }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="admin-eyebrow">Reviews</p>
          <h2>Ratings and comments</h2>
        </div>
      </div>

      <div className="panel-list">
        {reviews.map((review) => (
          <div className="list-row" key={review._id || review.id}>
            <div>
              <strong>{review.authorName}</strong>
              <p>{review.comment}</p>
            </div>
            <span className="pill approved">{review.rating}/5</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ReviewsPage;
