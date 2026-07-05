import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DatabasesPage from "./DatabasesPage";
import { delay, http, HttpResponse } from "msw";
import { server } from "../../test/mocks/server";

describe('DatabasesPage', () => {
    vi.mock("react-router-dom", async () => {
        const actual = await vi.importActual("react-router-dom") as any;
        return {
            ...actual,
            useOutletContext: () => ({ dbSearch: "" }), // Mock outlet context
            useNavigate: () => vi.fn(),
        };
    });


    it('render list of databases successfully', async () => {
        render(<DatabasesPage />)

        expect(await screen.findAllByText("ProductionDB")).toHaveLength(2);
        expect(screen.getAllByText("StagingDB")).toHaveLength(2);
    })

    it('ensure loaders are shown when in loading state', () => {
        server.use(
            http.get('http://localhost:3000/connections/summary', async () => {
                await delay('infinite');
                return HttpResponse.json({ data: [] })
            })
        )

        render(<DatabasesPage />);

        const skeletons = document.querySelectorAll('.animate-pulse'); 4
        expect(skeletons.length).toBeGreaterThan(0)
    })

    it('renders empty state when no databases are returned', async () => {
        server.use(
            http.get('http://localhost:3000/connections/summary', async () => {

                return HttpResponse.json({ data: [] })
            })
        )

        render(<DatabasesPage />);

        expect(await screen.findAllByText('No databases found')).toHaveLength(2);
    })

    it('renders error state when API fails', async () => {
        server.use(
            http.get('http://localhost:3000/connections/summary', async () => {

                return HttpResponse.json({ success: false, error: 'Error msg' }, { status: 500 })
            })
        )

        render(<DatabasesPage />);

        expect(await screen.findAllByText("Something went wrong")).toHaveLength(2);
        expect(screen.getAllByText('Request failed with status code 500')).toHaveLength(2);
    })
})