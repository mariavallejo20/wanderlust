import type { RequestHandler } from "msw";

import { tripHandlers } from "./trip.handlers";

export const handlers: RequestHandler[] = [...tripHandlers];
