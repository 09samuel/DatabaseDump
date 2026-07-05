import { describe, expect, it } from "vitest";
import { formatDateTime } from "./formatDate";



describe('Format Date', () => {
    it('should return — if no date passed', () => {
        expect(formatDateTime()).toBe('—');
        expect(formatDateTime(null)).toBe('—');
        expect(formatDateTime(undefined)).toBe('—');
    })

    it("should return date in dd MMM hh:mm am/pm format", () => {
        expect(formatDateTime("2025-01-20T05:30:00Z")).toBe("20 Jan, 11:00 am");
        expect(formatDateTime("2025-01-20T17:30:00Z")).toBe("20 Jan, 11:00 pm");
        expect(formatDateTime("2025-01-20T23:00:00Z")).toBe("21 Jan, 04:30 am");
        expect(formatDateTime("2025-01-20T00:00:00Z")).toBe("20 Jan, 05:30 am");
    });
})