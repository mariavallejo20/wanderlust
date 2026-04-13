import { DateTime } from "luxon";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
import * as z from "zod";

export const TripStatusSchema = z.enum([
    "DRAFT",
    "UPCOMING",
    "IN_PROGRESS",
    "COMPLETED",
]);

export type TripStatus = z.infer<typeof TripStatusSchema>;

const TripSchema = z
    .object({
        id: z.uuid(),
        title: z.string().trim().min(1).max(120),
        description: z.string().trim().max(2000).optional(),
        destination: z.string().trim().min(1).max(200),
        coverImage: z.string().trim().url().optional(),
        startDate: z.string().trim().date(),
        endDate: z.string().trim().date(),
        status: TripStatusSchema,
        currency: z.string().trim().length(3),
        tags: z.array(z.string().trim()).max(10).default([]),
        createdAt: z.string().trim().datetime(),
        updatedAt: z.string().trim().datetime(),
    })
    .refine((d) => d.endDate >= d.startDate, {
        path: ["endDate"],
        error: "endDate must be >= startDate",
    })
    .brand<"Trip">();

export type TripProps = z.infer<typeof TripSchema>;
export type TripInputProps = z.input<typeof TripSchema>;

export class Trip {
    private constructor(private readonly props: Readonly<TripProps>) {}

    get id(): TripProps["id"] {
        return this.props.id;
    }

    get title(): TripProps["title"] {
        return this.props.title;
    }

    get description(): TripProps["description"] {
        return this.props.description;
    }

    get destination(): TripProps["destination"] {
        return this.props.destination;
    }

    get coverImage(): TripProps["coverImage"] {
        return this.props.coverImage;
    }

    get startDate(): TripProps["startDate"] {
        return this.props.startDate;
    }

    get endDate(): TripProps["endDate"] {
        return this.props.endDate;
    }

    get status(): TripProps["status"] {
        return this.props.status;
    }

    get currency(): TripProps["currency"] {
        return this.props.currency;
    }

    get tags(): TripProps["tags"] {
        return this.props.tags;
    }

    get createdAt(): TripProps["createdAt"] {
        return this.props.createdAt;
    }

    get updatedAt(): TripProps["updatedAt"] {
        return this.props.updatedAt;
    }

    get durationInDays(): number {
        const start = DateTime.fromISO(this.props.startDate);
        const end = DateTime.fromISO(this.props.endDate);
        return Math.max(1, end.diff(start, "days").days + 1);
    }

    get isActive(): boolean {
        return this.props.status === "IN_PROGRESS";
    }

    get isPast(): boolean {
        return this.props.status === "COMPLETED";
    }

    get isDraft(): boolean {
        return this.props.status === "DRAFT";
    }

    static validate(
        props: Readonly<TripInputProps>,
    ): Result<TripProps, z.ZodError<TripInputProps>> {
        const result = TripSchema.safeParse(props);
        return result.success ? ok(result.data) : err(result.error);
    }

    static create(
        props: Readonly<TripInputProps>,
    ): Result<Trip, z.ZodError<TripInputProps>> {
        return Trip.validate(props).map(
            (validatedProps) => new Trip(validatedProps),
        );
    }

    toCreateProps(): TripInputProps {
        return {
            id: this.props.id,
            title: this.props.title,
            description: this.props.description,
            destination: this.props.destination,
            coverImage: this.props.coverImage,
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            status: this.props.status,
            currency: this.props.currency,
            tags: this.props.tags,
            createdAt: this.props.createdAt,
            updatedAt: this.props.updatedAt,
        };
    }
}
