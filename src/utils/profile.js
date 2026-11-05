export function validateProfileDetails(
  { firstName, lastName, phone },
  { requirePhone = true } = {},
) {
  const normalizedFirstName = firstName.trim();
  const normalizedLastName = lastName.trim();
  const normalizedPhone = phone.trim();
  const fullName = `${normalizedFirstName} ${normalizedLastName}`;

  if (
    normalizedFirstName.length < 2 ||
    normalizedLastName.length < 2 ||
    fullName.length > 70
  ) {
    throw new Error("El nombre y apellido deben sumar entre 4 y 70 caracteres.");
  }

  const phoneDigits = normalizedPhone.replace(/\D/g, "").length;
  const phoneIsValid =
    /^[0-9+(). -]{8,30}$/.test(normalizedPhone) &&
    phoneDigits >= 8 &&
    phoneDigits <= 15;
  if ((requirePhone && !normalizedPhone) || (normalizedPhone && !phoneIsValid)) {
    throw new Error("Ingresa un número de teléfono válido con código de país.");
  }

  return {
    firstName: normalizedFirstName,
    lastName: normalizedLastName,
    phone: normalizedPhone,
    fullName,
  };
}
