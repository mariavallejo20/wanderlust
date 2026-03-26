import { Spin } from "antd";
import { Suspense } from "react";
import { RouterProvider } from "react-router";

import { AntConfigProvider } from "@core/presentation/context/ant-config.provider";

import { router } from "./router";

function App() {
    return (
        <AntConfigProvider>
            <Suspense
                fallback={
                    <div className="tw:flex tw:min-h-screen tw:items-center tw:justify-center">
                        <Spin size="large" />
                    </div>
                }
            >
                <RouterProvider router={router} />
            </Suspense>
        </AntConfigProvider>
    );
}

export default App;
