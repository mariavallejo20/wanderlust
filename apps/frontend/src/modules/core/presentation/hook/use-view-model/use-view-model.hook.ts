import { useEffect, useRef } from "react";

import { container } from "@di/inversify.config";

import type { BaseViewModel } from "../../view-model/base/base.viewmodel";

export function useViewModel<T extends BaseViewModel>(identifier: symbol): T {
    const viewModelRef = useRef<T | null>(null);

    if (viewModelRef.current === null) {
        viewModelRef.current = container.get<T>(identifier);
    }

    const viewModel = viewModelRef.current;

    useEffect(() => {
        viewModel.didMount();

        return () => {
            viewModel.willUnmount();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return viewModel;
}
