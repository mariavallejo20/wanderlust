import { SearchOutlined } from "@ant-design/icons";
import type { ChangeEvent, FC } from "react";
import { useEffect, useRef, useState } from "react";

import { WlInput } from "@core/presentation/components/data-entry/input/wl-input.component";
import { useAppTranslation } from "@core/presentation/hook/use-app-translation/use-app-translation.hook";

const DEBOUNCE_MS = 300;

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

export const SearchBar: FC<SearchBarProps> = ({ onSearch, placeholder }) => {
    const { t } = useAppTranslation("dashboard");
    const [value, setValue] = useState("");
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const next = e.target.value ?? "";
        setValue(next);

        if (timerRef.current !== null) {
            clearTimeout(timerRef.current);
        }

        if (next === "") {
            onSearch("");
            return;
        }

        timerRef.current = setTimeout(() => {
            onSearch(next);
        }, DEBOUNCE_MS);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    return (
        <WlInput
            value={value}
            onChange={handleChange}
            placeholder={placeholder ?? t("search.placeholder")}
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 280 }}
        />
    );
};
