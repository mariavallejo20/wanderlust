import type { ButtonProps } from "antd";
import { Button } from "antd";
import type { FC } from "react";

export type WlButtonProps = ButtonProps;

export const WlButton: FC<WlButtonProps> = (props) => <Button {...props} />;
