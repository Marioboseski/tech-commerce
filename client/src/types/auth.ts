export type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

// Never contains the password.
export type ApiUser = {
  id: number;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt: string;
};
