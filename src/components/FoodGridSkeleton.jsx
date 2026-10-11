export default function FoodGridSkeleton({ count = 4 }) {
  return (
    <div className="food-grid" aria-busy="true" aria-label="Loading menu">
      {Array.from({ length: count }, (_, i) => <div className="skeleton" key={i} />)}
    </div>
  );
}
