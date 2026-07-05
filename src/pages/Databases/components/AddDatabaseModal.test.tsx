import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddDatabaseModal from "./AddDatabaseModal";

describe('AddDatabaseModal', () => {
    const mockOnClose = vi.fn();
    const mockOnSuccess = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('renders all default input fields and buttons', () => {
        render(<AddDatabaseModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

        expect(screen.getByPlaceholderText(/database name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/host/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/port/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/database engine/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/environment/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();

        expect(screen.getByRole('button', { name: /verify connection/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add database/i })).toBeDisabled(); // Disabled until verified
    });

    it('conditionally shows and hides SSL Mode based on the selected engine', async () => {
        render(<AddDatabaseModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

        const engineSelect = screen.getByLabelText(/database engine/i);

        // Initially no SSL mode dropdown
        expect(screen.queryByLabelText(/ssl mode/i)).not.toBeInTheDocument();

        // Select PostgreSQL -> should display SSL mode dropdown
        await userEvent.selectOptions(engineSelect, 'postgresql');
        expect(screen.getByLabelText(/ssl mode/i)).toBeInTheDocument();

        // Select MongoDB -> should hide SSL mode dropdown and change port placeholder
        await userEvent.selectOptions(engineSelect, 'mongodb');
        expect(screen.queryByLabelText(/ssl mode/i)).not.toBeInTheDocument();
        expect(screen.getByPlaceholderText(/not required for mongodb atlas/i)).toBeInTheDocument();
    });

    it('persist form values except password in localStorage', async () => {
        const { unmount } = render(<AddDatabaseModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

        // Populate inputs
        await userEvent.type(screen.getByPlaceholderText(/database name/i), 'UserDB');
        await userEvent.type(screen.getByPlaceholderText(/host/i), '127.0.0.1');
        await userEvent.type(screen.getByPlaceholderText(/username/i), 'testuser');
        await userEvent.type(screen.getByPlaceholderText(/password/i), 'secretpass');
        await userEvent.selectOptions(screen.getByLabelText(/database engine/i), 'postgresql');

        // Unmount component (simulating reload or closing modal)
        unmount();

        // Check if values were saved in localStorage
        const stored = JSON.parse(localStorage.getItem('add-database-form') || '{}');
        expect(stored.databaseName).toBe('UserDB');
        expect(stored.host).toBe('127.0.0.1');
        expect(stored.username).toBe('testuser');
        expect(stored.password).toBeUndefined(); // Security check: must not save password

        // Remount component -> should reload values
        render(<AddDatabaseModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

        expect(screen.getByPlaceholderText(/database name/i)).toHaveValue('UserDB');
        expect(screen.getByPlaceholderText(/host/i)).toHaveValue('127.0.0.1');
        expect(screen.getByPlaceholderText(/username/i)).toHaveValue('testuser');
        expect(screen.getByPlaceholderText(/password/i)).toHaveValue(''); // Password must be empty
    });

    it('triggers dry run connection verification successfully', async () => {
        render(<AddDatabaseModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

        // Fill validation requirements
        await userEvent.type(screen.getByPlaceholderText(/database name/i), 'SalesDB');
        await userEvent.type(screen.getByPlaceholderText(/host/i), 'sales.example.com');
        await userEvent.type(screen.getByPlaceholderText(/port/i), '5432');
        await userEvent.selectOptions(screen.getByLabelText(/database engine/i), 'postgresql');
        await userEvent.selectOptions(screen.getByLabelText(/environment/i), 'production');
        await userEvent.type(screen.getByPlaceholderText(/username/i), 'sales_user');
        await userEvent.type(screen.getByPlaceholderText(/password/i), 'sales_pass');

        const verifyBtn = screen.getByRole('button', { name: /verify connection/i });
        await userEvent.click(verifyBtn);

        // Assert success banner shows up and Submit button becomes active
        await waitFor(() => {
            expect(screen.getByText('Connection verified successfully')).toBeInTheDocument();
        });
        expect(screen.getByRole('button', { name: /add database/i })).toBeEnabled();
    });

    it('handles verification failure via MSW correctly', async () => {
        render(<AddDatabaseModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

        // Fill credentials but use "fail-pass" which triggers MSW validation failure
        await userEvent.type(screen.getByPlaceholderText(/database name/i), 'BadDB');
        await userEvent.type(screen.getByPlaceholderText(/host/i), 'bad.example.com');
        await userEvent.type(screen.getByPlaceholderText(/port/i), '5432');
        await userEvent.selectOptions(screen.getByLabelText(/database engine/i), 'postgresql');
        await userEvent.selectOptions(screen.getByLabelText(/environment/i), 'production');
        await userEvent.type(screen.getByPlaceholderText(/username/i), 'bad_user');
        await userEvent.type(screen.getByPlaceholderText(/password/i), 'fail-pass');

        const verifyBtn = screen.getByRole('button', { name: /verify connection/i });
        await userEvent.click(verifyBtn);

        // Assert failure feedback showing and Submit button remains disabled
        await waitFor(() => {
            expect(screen.getByText('Verification failed. Please check credentials.')).toBeInTheDocument();
        });
        expect(screen.getByRole('button', { name: /add database/i })).toBeDisabled();
    });

    it("successfully creates the database connection", async () => {
        render(<AddDatabaseModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

        // 1. Complete verification step
        await userEvent.type(screen.getByPlaceholderText(/database name/i), "SalesDB");
        await userEvent.type(screen.getByPlaceholderText(/host/i), "sales.example.com");
        await userEvent.type(screen.getByPlaceholderText(/port/i), "5432");
        await userEvent.selectOptions(screen.getByLabelText(/database engine/i), "postgresql");
        await userEvent.selectOptions(screen.getByLabelText(/environment/i), "production");
        await userEvent.type(screen.getByPlaceholderText(/username/i), "sales_user");
        await userEvent.type(screen.getByPlaceholderText(/password/i), "sales_pass");

        await userEvent.click(screen.getByRole("button", { name: /verify connection/i }));

        const verifiedMsg = await screen.findByText("Connection verified successfully");
        expect(verifiedMsg).toBeInTheDocument();

        const submitBtn = screen.getByRole("button", { name: /add database/i });
        expect(submitBtn).toBeEnabled();

        // 2. Click Add Database
        await userEvent.click(submitBtn);

        // 3. Verify that the creation success status bar is displayed
        const addingMsg = await screen.findByText("Database added. Verifying connection...");
        expect(addingMsg).toBeInTheDocument();
    });
}); 