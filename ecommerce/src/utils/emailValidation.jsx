export const emailValidation = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@metropolia.fi$/;
    return emailRegex.test(email);
}
