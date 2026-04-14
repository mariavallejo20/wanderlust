import type { InputProps } from "antd";
import { Input } from "antd";
import type { FC } from "react";

export type WlInputProps = InputProps;

export const WlInput: FC<WlInputProps> = (props) => <Input {...props} />;
