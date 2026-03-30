import "@testing-library/jest-dom/vitest";

import { afterAll, afterEach, beforeAll, expect } from "vitest";

import { server } from "@tests/msw/server";
import { customMatchers } from "@tests/utils/custom-matchers";

expect.extend(customMatchers);

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
