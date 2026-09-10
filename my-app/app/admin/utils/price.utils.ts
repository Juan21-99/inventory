export const formatPrice = (value: string): string => {
  const numbers = value.replaceAll(/\D/g, "");
  return numbers.replaceAll(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const parsePrice = (value: string): string => {
  return value.replaceAll(".", "");
};

export const validatePrices = (
  price: number,
  originalPrice: number,
): { valid: boolean; error?: string } => {
  if (originalPrice > 0 && originalPrice <= price) {
    return {
      valid: false,
      error: "Harga Normal (Coret) harus lebih besar dari Harga Jual!",
    };
  }
  return { valid: true };
};
