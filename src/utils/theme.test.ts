import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyTheme, getInitialTheme, initializeTheme, setThemePreference, THEME_STORAGE_KEY } from "./theme";


describe('Theme Utility', () => {
    //reset browser globals after each run
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.className = '';
        vi.restoreAllMocks();
    })


    describe('getInitialTheme', () => {
        it('returns stored theme if exists in localStorage (dark)', () => {
            //SETUP
            localStorage.setItem(THEME_STORAGE_KEY, 'dark');
            //ACT
            expect(getInitialTheme()).toBe('dark');
        })

        it('returns stored theme if exists in localStorage (light)', () => {
            //SETUP
            localStorage.setItem(THEME_STORAGE_KEY, 'light');
            //ACT
            expect(getInitialTheme()).toBe('light');
        })

        it('falls back to dark mode if no storage and OS prefers dark mode', () => {
            // Mock OS-level dark mode active
            mockMatchMedia(true);

            expect(getInitialTheme()).toBe('dark');
        });

        it('falls back to light mode if no storage and OS prefers light mode', () => {
            // Mock OS-level light mode active
            mockMatchMedia(false);

            expect(getInitialTheme()).toBe('light');
        });
    })

    describe('applyTheme', () => {
        it('adds "dark" class to documentElement when theme is dark', () => {
            applyTheme('dark');
            expect(document.documentElement.classList.contains('dark')).toBe(true);
        });
        it('removes "dark" class from documentElement when theme is light', () => {
            // Pre-add the class
            document.documentElement.classList.add('dark');

            applyTheme('light');
            expect(document.documentElement.classList.contains('dark')).toBe(false);
        });
    })

    describe('initializeTheme', () => {
        it('detects initial theme and applies it to the DOM', () => {
            localStorage.setItem(THEME_STORAGE_KEY, 'dark');

            const detectedTheme = initializeTheme();

            expect(detectedTheme).toBe('dark');
            expect(document.documentElement.classList.contains('dark')).toBe(true);
        });
    })

    describe('setThemePreference', () => {
        it('saves theme to localStorage and updates the DOM class', () => {
            setThemePreference('dark');

            expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
            expect(document.documentElement.classList.contains('dark')).toBe(true);
        });
    });
})

// Helper function to mock window.matchMedia behavior in JSDOM
function mockMatchMedia(matches: boolean) {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
}