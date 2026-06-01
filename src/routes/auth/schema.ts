import { type } from 'arktype';

export const RegisterBody = type({
  name: 'string>0',
  email: 'string.email',
  password: 'string>=8',
});

export const LoginBody = type({
  email: 'string.email',
  password: 'string',
});
