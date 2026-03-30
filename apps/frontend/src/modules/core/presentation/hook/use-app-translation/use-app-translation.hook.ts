import { useTranslation } from "react-i18next";

import type Resources from "@wanderlust/@types/resources";

export function useAppTranslation<N extends keyof Resources>(ns: N) {
    return useTranslation(ns);
}
