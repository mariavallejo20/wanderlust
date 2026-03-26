import { Typography } from "antd";

import { useAppTranslation } from "@core/presentation/hook/use-app-translation/use-app-translation.hook";

export const DashboardPage = () => {
    const { t } = useAppTranslation("common");

    return (
        <div className="tw:p-6">
            <Typography.Title level={2}>
                {t("pages.dashboard")}
            </Typography.Title>
        </div>
    );
};
