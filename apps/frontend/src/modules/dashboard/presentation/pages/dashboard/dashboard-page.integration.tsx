import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { container } from "@di/inversify.config";
import { createTripDtoFixture } from "@tests/msw/handlers/trip.handlers";

import { DashboardPage } from "./dashboard-page";

function renderDashboardPage() {
    return render(
        <MemoryRouter>
            <DashboardPage />
        </MemoryRouter>,
    );
}

describe("DashboardPage - Integration", () => {
    beforeEach(() => {
        container.snapshot();
    });

    afterEach(() => {
        container.restore();
    });

    it("renders trip titles after didMount resolves", async () => {
        renderDashboardPage();

        const fixture = createTripDtoFixture();

        await waitFor(() => {
            expect(screen.getByText(fixture.title)).toBeInTheDocument();
        });
    });
});
