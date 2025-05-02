export interface User {
    id: string;
    firstName?: string;
    lastName?: string;
    username: string;
    email: string;
    roles: string[];
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
  }
  
  export interface RegisterCredentials {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }