import type { Access } from "./access";

export function register(access: Access): never {
    throw new Error(`Not implemented: register(${access.email})`);
}