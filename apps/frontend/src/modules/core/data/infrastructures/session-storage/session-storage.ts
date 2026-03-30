import { injectable } from "inversify";

import type { Nullable } from "@core/domain/types/utility.types";

export enum SessionStorageKeys {
    AppMode = "wanderlust_app_mode",
}

@injectable()
export class SessionStorage {
    get(key: SessionStorageKeys): Nullable<string> {
        return window.sessionStorage.getItem(key);
    }

    set(key: SessionStorageKeys, value: string): void {
        window.sessionStorage.setItem(key, value);
    }

    getObject<T>(key: SessionStorageKeys): Nullable<T> {
        const value = this.get(key);
        if (value === null) {
            return null;
        }
        try {
            return JSON.parse(value) as T;
        } catch {
            return null;
        }
    }

    setObject<T>(key: SessionStorageKeys, value: T): void {
        this.set(key, JSON.stringify(value));
    }

    getInt(key: SessionStorageKeys): Nullable<number> {
        const value = this.get(key);
        if (value === null) {
            return null;
        }
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? null : parsed;
    }

    setInt(key: SessionStorageKeys, value: number): void {
        this.set(key, value.toString());
    }

    remove(key: SessionStorageKeys): void {
        window.sessionStorage.removeItem(key);
    }

    clear(): void {
        window.sessionStorage.clear();
    }
}
