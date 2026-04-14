import type { FlexProps } from "antd";
import { Flex } from "antd";
import type { FC } from "react";

export type WlFlexProps = FlexProps;

export const WlFlex: FC<WlFlexProps> = (props) => <Flex {...props} />;
