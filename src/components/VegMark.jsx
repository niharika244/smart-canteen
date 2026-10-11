export default function VegMark({ veg }) {
  return (
    <span className={`veg-mark ${veg ? 'veg-mark--veg' : 'veg-mark--nonveg'}`} role="img" aria-label={veg ? 'Vegetarian' : 'Non-vegetarian'}>
      <span />
    </span>
  );
}
