import type { FixlenHexString, HexString, Uint8_t, Uint16_t, Uint32_t, Uint64_str, ValidBIP32Path, VarlenAsciiString } from "./types/internal";

export const MAX_UINT_64_STR = "18446744073709551615";

export const isString = (data: unknown): data is string =>
    typeof data === "string"

export const isInteger = (data: unknown): data is number =>
    Number.isInteger(data)

export const isArray = (data: unknown): data is Array<unknown> =>
    Array.isArray(data)

export const isBuffer = (data: unknown): data is Buffer =>
    Buffer.isBuffer(data)

export const isUint32 = (data: unknown): data is Uint32_t =>
    isInteger(data) && data >= 0 && data <= 4294967295

export const isUint16 = (data: unknown): data is Uint16_t =>
    isInteger(data) && data >= 0 && data <= 65535

export const isUint8 = (data: unknown): data is Uint8_t =>
    isInteger(data) && data >= 0 && data <= 255

export const isHexString = (data: unknown): data is HexString =>
    isString(data) && data.length % 2 === 0 && /^[0-9a-fA-F]*$/.test(data)

export const isHexStringOfLength = <L extends number>(data: unknown, expectedByteLength: L): data is FixlenHexString<L> =>
    isHexString(data) && data.length === expectedByteLength * 2

export const isValidPath = (data: unknown): data is ValidBIP32Path =>
    isArray(data) && data.every(x => isUint32(x)) && data.length < 10

export const isUint64str = (data: unknown): data is Uint64_str =>
    isUintStr(data, {})

export const isUintStr = (data: unknown, constraints: { min?: string, max?: string }): data is string => {
    const min = constraints.min ?? "0"
    const max = constraints.max ?? MAX_UINT_64_STR

    return isString(data)
        && /^[0-9]*$/.test(data)
        // Length checks
        && data.length > 0
        && data.length <= max.length
        // Leading zeros
        && (data.length === 0 || data[0] !== "0")
        // less or equal than max value
        && (data.length < max.length ||
            // Note: this is string comparison!
            data <= max
        ) && (data.length > min.length ||
            // Note: this is string comparison!
            data >= min
        )
}

export function validate(cond: boolean, errMsg: string): asserts cond {
    // TODO: Error
    if (!cond) throw new Error(errMsg)
}


export function parseAscii(str: unknown, err: string): VarlenAsciiString {
    validate(isString(str), err);
    validate(
        str.split("").every((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126),
        err
    );
    return str as VarlenAsciiString
}


export function parseHexString(str: unknown, err: string): HexString {
    validate(isHexString(str), err)
    return str
}

export function parseHexStringOfLength<L extends number>(str: unknown, length: L, err: string): FixlenHexString<L> {
    validate(isHexStringOfLength(str, length), err)
    return str
}

export function parseUint64_str(str: unknown, constraints: { min?: string, max?: string }, err: string): Uint64_str {
    validate(isUint64str(str) && isUintStr(str, constraints), err)
    return str
}

export function parseUint32_t(value: unknown, err: string): Uint32_t {
    validate(isUint32(value), err)
    return value
}

export function parseUint16_t(value: unknown, err: string): Uint16_t {
    validate(isUint16(value), err)
    return value
}

export function parseUint8_t(value: number, err: string): Uint8_t {
    validate(isUint8(value), err)
    return value
}

export function parseBIP32Path(value: unknown, err: string): ValidBIP32Path {
    validate(isValidPath(value), err)
    return value
}


export function parseIntFromStr(str: string, err: string): number {
    validate(isString(str), err)
    const i = parseInt(str);
    // Check that we parsed everything
    validate("" + i === str, err);
    // Could be invalid
    validate(!isNaN(i), err);
    // Could still be float
    validate(isInteger(i), err);
    return i;
}