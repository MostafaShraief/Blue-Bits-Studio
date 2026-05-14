export interface LoginResponse {
    token: string;
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    authorizedWorkflows: string[];
}

export interface User {
    token: string;
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    allowedWorkflows: string[];
}

export interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}
