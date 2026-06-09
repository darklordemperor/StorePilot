export type Role = "OWNER" | "MANAGER" | "STAFF";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = LoginInput & {
  name?: string;
  role?: Role;
};

export type AuthState = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};
