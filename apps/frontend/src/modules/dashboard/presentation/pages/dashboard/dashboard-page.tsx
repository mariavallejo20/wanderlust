import { WlTypographyTitle } from "@core/presentation/components/general/typography/wl-typography.component";
import { useAppTranslation } from "@core/presentation/hook/use-app-translation/use-app-translation.hook";

export const DashboardPage = () => {
    const { t } = useAppTranslation("common");

    return (
        <div className="tw:p-6">
            <WlTypographyTitle level={2}>
                {t("pages.dashboard")}
            </WlTypographyTitle>
        </div>
    );
};
