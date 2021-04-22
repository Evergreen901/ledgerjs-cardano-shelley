import type { ParsedPoolMetadata, ParsedPoolOwner, ParsedPoolParams, ParsedPoolRelay, Uint8_t, Uint32_t } from "../../types/internal";
import { PoolOwnerType, RelayType } from "../../types/internal";
import { unreachable } from "../../utils/assert";
import { hex_to_buf, path_to_buf, uint8_to_buf, uint16_to_buf, uint32_to_buf, uint64_to_buf } from "../../utils/serialize";


const SignTxIncluded = Object.freeze({
    SIGN_TX_INCLUDED_NO: 1,
    SIGN_TX_INCLUDED_YES: 2,
});


export function serializePoolInitialParams(pool: ParsedPoolParams): Buffer {
    return Buffer.concat([
        hex_to_buf(pool.keyHashHex),
        hex_to_buf(pool.vrfHashHex),
        uint64_to_buf(pool.pledge),
        uint64_to_buf(pool.cost),
        uint64_to_buf(pool.margin.numerator),
        uint64_to_buf(pool.margin.denominator),
        hex_to_buf(pool.rewardAccountHex),
        uint32_to_buf(pool.owners.length as Uint32_t),
        uint32_to_buf(pool.relays.length as Uint32_t),
    ]);
}

export function serializePoolOwner(owner: ParsedPoolOwner): Buffer {
    const typeHeader: Record<PoolOwnerType, Uint8_t> = {
        [PoolOwnerType.DEVICE_OWNED]: 1 as Uint8_t,
        [PoolOwnerType.THIRD_PARTY]: 2 as Uint8_t,
    }
    switch (owner.type) {
        case PoolOwnerType.DEVICE_OWNED: {
            return Buffer.concat([
                uint8_to_buf(typeHeader[owner.type]),
                path_to_buf(owner.path)
            ])
        }
        case PoolOwnerType.THIRD_PARTY: {
            return Buffer.concat([
                uint8_to_buf(typeHeader[owner.type]),
                hex_to_buf(owner.hashHex)
            ])
        }
        default:
            unreachable(owner)
    }
}

export function serializePoolRelay(relay: ParsedPoolRelay): Buffer {
    function serializeOptional<T>(x: T | null, cb: (t: T) => Buffer): Buffer {
        const enum Optional {
            NONE = 1,
            SOME = 2
        }

        if (x == null) {
            return Buffer.concat([
                uint8_to_buf(Optional.NONE as Uint8_t),
            ])
        } else {
            return Buffer.concat([
                uint8_to_buf(Optional.SOME as Uint8_t),
                cb(x)
            ])
        }
    }

    switch (relay.type) {
        case RelayType.SINGLE_HOST_IP_ADDR: {
            return Buffer.concat([
                uint8_to_buf(relay.type as Uint8_t),
                serializeOptional(relay.port, port => uint16_to_buf(port)),
                serializeOptional(relay.ipv4, ipv4 => ipv4),
                serializeOptional(relay.ipv6, ipv6 => ipv6)
            ])
        }
        case RelayType.SINGLE_HOST_HOSTNAME: {
            return Buffer.concat([
                uint8_to_buf(relay.type as Uint8_t),
                serializeOptional(relay.port, port => uint16_to_buf(port)),
                Buffer.from(relay.dnsName, "ascii")
            ])
        }
        case RelayType.MULTI_HOST: {
            return Buffer.concat([
                uint8_to_buf(relay.type as Uint8_t),
                Buffer.from(relay.dnsName, "ascii")
            ])
        }
        default:
            unreachable(relay)
    }
}

export function serializePoolMetadata(
    metadata: ParsedPoolMetadata | null
): Buffer {
    if (metadata == null) {
        return Buffer.concat([
            uint8_to_buf(SignTxIncluded.SIGN_TX_INCLUDED_NO as Uint8_t)
        ])
    } else {
        return Buffer.concat([
            uint8_to_buf(SignTxIncluded.SIGN_TX_INCLUDED_YES as Uint8_t),
            hex_to_buf(metadata.hashHex),
            Buffer.from(metadata.url, 'ascii')
        ])
    }
}
