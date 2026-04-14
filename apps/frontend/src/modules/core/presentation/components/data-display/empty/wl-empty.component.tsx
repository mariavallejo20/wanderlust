import type { EmptyProps } from "antd";
import { Empty } from "antd";
import type { FC } from "react";

export type WlEmptyProps = EmptyProps;

export const WlEmpty: FC<WlEmptyProps> = (props) => <Empty {...props} />;
