export const validatePhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replaceAll(/\D/g, "");
  return /^62\d{8,15}$/.test(cleaned);
};

export const formatPhoneNumber = (phone: string): string => {
  let cleaned = phone.replaceAll(/\D/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }

  return cleaned;
};

export const displayPhoneNumber = (phone: string): string => {
  const cleaned = phone.replaceAll(/\D/g, "");

  if (cleaned.startsWith("62")) {
    return "0" + cleaned.slice(2);
  }

  return phone;
};
