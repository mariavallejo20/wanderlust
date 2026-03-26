import { Link } from "react-router";

import { WlResult } from "@core/presentation/components/feedback/result/wl-result.component";
import { WlButton } from "@core/presentation/components/general/button/wl-button.component";
import { useAppTranslation } from "@core/presentation/hook/use-app-translation/use-app-translation.hook";
import { RoutePaths } from "@wanderlust/route-paths";

export const NotFoundPage = () => {
    const { t } = useAppTranslation("common");

    return (
        <WlResult
            status="404"
            title={t("pages.notFound")}
            subTitle={t("notFound.message")}
            extra={
                <Link to={RoutePaths.dashboard}>
                    <WlButton type="primary">{t("notFound.backHome")}</WlButton>
                </Link>
            }
        />
    );
};
