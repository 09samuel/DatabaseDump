import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./mocks/server";

// Start intercepting requests before running any tests
beforeAll(() => server.listen());

afterEach(() => {
    cleanup();
    //Reset handlers to initial defaults (clearing any runtime overrides)
    server.resetHandlers();
});

// Clean up after the test suite completes
afterAll(() => server.close());