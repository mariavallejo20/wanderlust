import type { SkeletonProps } from "antd";
import { Skeleton } from "antd";
import type { FC } from "react";

export type WlSkeletonProps = SkeletonProps;

export const WlSkeleton: FC<WlSkeletonProps> = (props) => (
    <Skeleton {...props} />
);
