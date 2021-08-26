// @ts-ignore
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid"
import SpeculosTransport from "@ledgerhq/hw-transport-node-speculos"

import Ada from "../src/Ada"

export function shouldUseSpeculos(): boolean {
    return process.env.LEDGER_TRANSPORT === 'speculos'
}

export function getTransport() {
    return shouldUseSpeculos()
        ? SpeculosTransport.open({apduPort: 9999})
        : TransportNodeHid.create(1000)
}

export async function getAda() {
    const transport = await getTransport()

    const ada = new Ada(transport);
    (ada as any).t = transport
    return Promise.resolve(ada)
}

const ProtocolMagics = {
    MAINNET: 764824073,
    TESTNET: 42,
}

const NetworkIds = {
    TESTNET: 0x00,
    MAINNET: 0x01,
}

export const Networks = {
    Mainnet: {
        networkId: NetworkIds.MAINNET,
        protocolMagic: ProtocolMagics.MAINNET,
    },
    Testnet: {
        networkId: NetworkIds.TESTNET,
        protocolMagic: ProtocolMagics.TESTNET,
    },
    Fake: {
        networkId: 0x03,
        protocolMagic: 47,
    },
}
