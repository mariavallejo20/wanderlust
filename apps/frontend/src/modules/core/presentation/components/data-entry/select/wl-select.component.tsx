import type { SelectProps } from "antd";
import { Select } from "antd";
import type { FC } from "react";

export type WlSelectProps = SelectProps;

export const WlSelect: FC<WlSelectProps> = (props) => <Select {...props} />;
