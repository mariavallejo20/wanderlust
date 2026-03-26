import type { SpinProps } from "antd";
import { Spin } from "antd";
import type { FC } from "react";

export type WlSpinProps = SpinProps;

export const WlSpin: FC<WlSpinProps> = (props) => <Spin {...props} />;
