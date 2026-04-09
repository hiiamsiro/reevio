export class AuthEmailAlreadyRegisteredError extends Error {
  public readonly code: string;

  public constructor(email: string) {
    super(`The email "${email}" is already registered.`);
    this.name = 'AuthEmailAlreadyRegisteredError';
    this.code = 'AUTH_EMAIL_ALREADY_REGISTERED';
  }
}

export class AuthInvalidCredentialsError extends Error {
  public readonly code: string;

  public constructor() {
    super('The email or password is incorrect.');
    this.name = 'AuthInvalidCredentialsError';
    this.code = 'AUTH_INVALID_CREDENTIALS';
  }
}

export class AuthRateLimitError extends Error {
  public readonly code: string;

  public constructor() {
    super('Too many authentication attempts. Please wait a few minutes and try again.');
    this.name = 'AuthRateLimitError';
    this.code = 'AUTH_RATE_LIMITED';
  }
}
