const METROMAIL = "@metropolia.fi";

const isValidEmail = (inputEmail) => {
  const emailCheck = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/g;
  return inputEmail.match(emailCheck) !== null;
};

const isValidMetro = (inputMail) => {
  const metroLength = METROMAIL.length;
  const inputMailEnding = inputMail.slice(-metroLength);
  return inputMailEnding === METROMAIL;
};

export const emailCheck = (email) => {
  if (isValidEmail(email) && isValidMetro(email)) {
    return true;
  }
  return false;
};
