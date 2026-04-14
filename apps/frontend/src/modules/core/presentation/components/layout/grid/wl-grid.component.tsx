import type { ColProps, RowProps } from "antd";
import { Col, Row } from "antd";
import type { FC } from "react";

export type WlRowProps = RowProps;
export type WlColProps = ColProps;

export const WlRow: FC<WlRowProps> = (props) => <Row {...props} />;
export const WlCol: FC<WlColProps> = (props) => <Col {...props} />;
