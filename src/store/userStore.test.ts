import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUserStore } from "./userStore";
import { userInfo } from "../services/authentication.service";

//ock the authentication service module
vi.mock("../services/authentication.service", () => ({
    userInfo: vi.fn(),
}));

describe('useUserStore', () => {
    const mockUser = { id: 'id-01', name: 'Samuel', email: 'samuel@gmail.com' };

    beforeEach(() => {
        vi.clearAllMocks();

        useUserStore.setState({ user: null, loading: true, initialized: false });
    });

    it('should have correct initial state', () => {
        const state = useUserStore.getState();
        expect(state.user).toBeNull();
        expect(state.loading).toBe(true);
        expect(state.initialized).toBe(false);
    });

    it('should set user successfully', () => {
        useUserStore.getState().setUser(mockUser);
        const state = useUserStore.getState();
        expect(state.user).toEqual(mockUser);
    });

    it('should fetch and set user successfully', async () => {
        vi.mocked(userInfo).mockResolvedValueOnce({
            data: mockUser,
            success: true
        })

        await useUserStore.getState().fetchUser()

        const state = useUserStore.getState();
        expect(state.user).toEqual(mockUser)
        expect(state.loading).toBe(false)
        expect(state.initialized).toBe(true)
    })

    it('should handle fetch failure and reset user to null', async () => {
        vi.mocked(userInfo).mockRejectedValueOnce(new Error('Network Error'));
        await useUserStore.getState().fetchUser();
        const state = useUserStore.getState();
        expect(state.user).toBeNull();
        expect(state.loading).toBe(false);
        expect(state.initialized).toBe(true);
    });


    it('should clear user successfully', () => {
        useUserStore.getState().setUser(mockUser);

        expect(useUserStore.getState().user).toEqual(mockUser);

        useUserStore.getState().clearUser();

        expect(useUserStore.getState().user).toBeNull();
        expect(useUserStore.getState().initialized).toBe(true);
    });

})