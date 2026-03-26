import type { ResultProps } from "antd";
import { Result } from "antd";
import type { FC } from "react";

export type WlResultProps = ResultProps;

export const WlResult: FC<WlResultProps> = (props) => <Result {...props} />;
