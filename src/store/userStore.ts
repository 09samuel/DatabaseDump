import { create } from 'zustand';
import { userInfo } from '../services/authentication.service';

type User = {
    name: string;
    email: string;
};

type UserState = {
    user: User | null;
    loading: boolean;
    fetchUser: () => Promise<void>;
};

export const useUserStore = create<UserState>((set) => ({
    user: null,
    loading: true,
    fetchUser: async () => {
        try {
            const userData = await userInfo();
            set({ user: userData.data, loading: false });
        } catch (err) {
            set({ user: null, loading: false });
        }
    },
}));