import { Button, Result } from "antd";
import { Link } from "react-router";

import { useAppTranslation } from "@core/presentation/hook/use-app-translation/use-app-translation.hook";
import { RoutePaths } from "@wanderlust/route-paths";

export const NotFoundPage = () => {
    const { t } = useAppTranslation("common");

    return (
        <Result
            status="404"
            title={t("pages.notFound")}
            subTitle={t("notFound.message")}
            extra={
                <Link to={RoutePaths.dashboard}>
                    <Button type="primary">{t("notFound.backHome")}</Button>
                </Link>
            }
        />
    );
};
