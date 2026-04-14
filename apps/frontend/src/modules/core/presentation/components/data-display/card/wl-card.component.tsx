import type { CardProps } from "antd";
import { Card } from "antd";
import type { FC } from "react";

export type WlCardProps = CardProps;

export const WlCard: FC<WlCardProps> = (props) => <Card {...props} />;
