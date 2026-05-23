import { create } from 'zustand';
import { userInfo } from '../services/authentication.service';

type User = {
    name: string;
    email: string;
};

type UserState = {
    user: User | null;
    loading: boolean;
    initialized: boolean;
    fetchUser: () => Promise<void>;
    setUser: (user: User) => void;
    clearUser: () => void;
};

export const useUserStore = create<UserState>((set) => ({
    user: null,
    loading: true,
    initialized: false,
    fetchUser: async () => {
        set({ loading: true });
        
        try {
            const userData = await userInfo();
            set({ user: userData.data, loading: false, initialized: true });
        } catch (err) {
            set({ user: null, loading: false, initialized: true });
        }
    },
    setUser: (user) => set({ user, initialized: true }),
    clearUser: () => set({ user: null, initialized: true }),
}));