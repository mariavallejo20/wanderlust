import * as z from "zod";

export const TripDtoSchema = z
    .object({
        id: z.string().trim(),
        title: z.string().trim(),
        description: z.string().trim().optional(),
        destination: z.string().trim(),
        coverImage: z.string().trim().optional(),
        startDate: z.string().trim(),
        endDate: z.string().trim(),
        status: z.string().trim(),
        currency: z.string().trim(),
        tags: z.array(z.string().trim()).default([]),
        createdAt: z.string().trim(),
        updatedAt: z.string().trim(),
    })
    .passthrough();

export type TripDto = z.infer<typeof TripDtoSchema>;
