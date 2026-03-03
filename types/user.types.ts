// types/user.types.ts
export interface IUser {
  id: string;
  email: string;
  username: string;
  enabled?: string;
  roles: {
    id: string;
    name: string;
    description: string;
    permissions: {
      id: string,
      name: string,
      resource: string,
      action: string,
      description: string
    }[];
  }[];
  permissions: string[]
}

export interface IAuthTokens {
  accessToken: string;
  tokenType?: string;
  expiresIn?: number; // Unix timestamp
}

export interface IUserSession {
  user: IUser;
  tokens: IAuthTokens;
}