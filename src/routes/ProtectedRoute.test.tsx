import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUserStore } from "../store/userStore";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { render, screen } from "@testing-library/react";

vi.mock("../store/userStore", () => ({
    useUserStore: vi.fn(),
}));

describe('ProtectedRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state and calls fetchUser when initialized is false', () => {
        const fetchUser = vi.fn()
        vi.mocked(useUserStore).mockReturnValue({
            user: null,
            loading: true,
            initialized: false,
            fetchUser: fetchUser
        });

        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<div>Dashboard</div>} />
                    </Route>
                    <Route path='/login' element={<div>Login</div>} />
                </Routes>
            </MemoryRouter>
        )

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
        expect(fetchUser).toHaveBeenCalledTimes(1);
    })

    it('redirect unauthenticated users to /login', () => {
        vi.mocked(useUserStore).mockReturnValue({
            user: null,
            loading: false,
            initialized: true,
            fetchUser: vi.fn()
        });

        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<div>Dashboard</div>} />
                    </Route>
                    <Route path='/login' element={<div>Login</div>} />
                </Routes>
            </MemoryRouter>
        )

        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    })

    it('renders protected child content for authenticated users', () => {
        const mockUser = {
            id: "1",
            name: "John",
            email: "john@example.com",
        };

        vi.mocked(useUserStore).mockReturnValue({
            user: mockUser,
            loading: false,
            initialized: true,
            fetchUser: vi.fn()
        });

        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<div>Dashboard</div>} />
                    </Route>
                    <Route path='/login' element={<div>Login</div>} />
                </Routes>
            </MemoryRouter>
        )

        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
    })
})