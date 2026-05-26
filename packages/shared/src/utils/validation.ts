export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const MESSAGE_MAX_LENGTH = 4000;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function isValidUsername(username: string): boolean {
  return (
    username.length >= USERNAME_MIN_LENGTH &&
    username.length <= USERNAME_MAX_LENGTH &&
    USERNAME_REGEX.test(username)
  );
}

export function isValidPassword(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH;
}
