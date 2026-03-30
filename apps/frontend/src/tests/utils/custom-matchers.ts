import type { Result } from "neverthrow";

export const customMatchers = {
    toBeOk(received: Result<unknown, unknown>) {
        return received.isOk()
            ? {
                  pass: true,
                  message: () => "Expected Result to be Err but it was Ok",
              }
            : {
                  pass: false,
                  message: () =>
                      `Expected Result to be Ok but got Err: ${JSON.stringify(received.error)}`,
              };
    },
    toBeErr(received: Result<unknown, unknown>) {
        return received.isErr()
            ? {
                  pass: true,
                  message: () => "Expected Result to be Ok but it was Err",
              }
            : {
                  pass: false,
                  message: () =>
                      `Expected Result to be Err but it was Ok: ${JSON.stringify(received.value)}`,
              };
    },
};

declare module "vitest" {
    interface Assertion<T = unknown> {
        toBeOk(): Assertion<T>;
        toBeErr(): Assertion<T>;
    }
    interface AsymmetricMatchersContaining {
        toBeOk(): AsymmetricMatchersContaining;
        toBeErr(): AsymmetricMatchersContaining;
    }
}
