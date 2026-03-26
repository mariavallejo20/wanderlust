import { Suspense } from "react";
import { RouterProvider } from "react-router";

import { WlSpin } from "@core/presentation/components/feedback/spin/wl-spin.component";
import { AntConfigProvider } from "@core/presentation/context/ant-config.provider";

import { router } from "./router";

function App() {
    return (
        <AntConfigProvider>
            <Suspense
                fallback={
                    <div className="tw:flex tw:min-h-screen tw:items-center tw:justify-center">
                        <WlSpin size="large" />
                    </div>
                }
            >
                <RouterProvider router={router} />
            </Suspense>
        </AntConfigProvider>
    );
}

export default App;
