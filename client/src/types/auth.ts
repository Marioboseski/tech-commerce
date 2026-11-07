// What the register form sends to the server.
export type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
};

// What the server sends back. It never contains the password.
export type ApiUser = {
  id: number;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt: string;
};
