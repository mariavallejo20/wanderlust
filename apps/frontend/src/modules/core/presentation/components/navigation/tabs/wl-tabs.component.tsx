import type { TabsProps } from "antd";
import { Tabs } from "antd";
import type { FC } from "react";

export type WlTabsProps = TabsProps;

export const WlTabs: FC<WlTabsProps> = (props) => <Tabs {...props} />;
