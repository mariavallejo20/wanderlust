import type { TagProps } from "antd";
import { Tag } from "antd";
import type { FC } from "react";

export type WlTagProps = TagProps;

export const WlTag: FC<WlTagProps> = (props) => <Tag {...props} />;
