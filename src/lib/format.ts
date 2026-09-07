export function formatPrice(value: number) {
  return value.toLocaleString("pl-PL", {
    style: "currency",
    currency: "PLN",
  });
}

export function formatCount(value: number) {
  return value.toLocaleString("pl-PL");
}
