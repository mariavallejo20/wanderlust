import type { FC } from "react";

import { WlEmpty } from "@core/presentation/components/data-display/empty/wl-empty.component";
import { WlTypographyText } from "@core/presentation/components/general/typography/wl-typography.component";
import { useAppTranslation } from "@core/presentation/hook/use-app-translation/use-app-translation.hook";

export const EmptyState: FC = () => {
    const { t } = useAppTranslation("common");

    return (
        <WlEmpty
            description={
                <>
                    <WlTypographyText strong>
                        {t("emptyState.title")}
                    </WlTypographyText>
                    <br />
                    <WlTypographyText type="secondary">
                        {t("emptyState.description")}
                    </WlTypographyText>
                </>
            }
        />
    );
};
