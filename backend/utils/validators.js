// Email validation regex
export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Password validation (min 6 chars, at least one number and one letter)
export const validatePassword = (password) => {
    return password.length >= 6 && /[a-zA-Z]/.test(password) && /\d/.test(password);
};

// Validate name (letters and spaces only, 2-50 chars)
export const validateName = (name) => {
    const re = /^[a-zA-Z\s]{2,50}$/;
    return re.test(name);
};