import { Cell, beginCell, toNano, Address, Contract, ContractProvider, Sender, SendMode } from '@ton/core';
import { JettonMaster } from '@ton/ton';
import { JettonLocker } from '../wrappers/JettonLocker';
import { compile, NetworkProvider } from '@ton/blueprint';

export class SimpleContract implements Contract {
    constructor(readonly address: Address) {}

    static createFromAddress(address: Address) {
        return new SimpleContract(address);
    }

    async sendSimpleMessage(provider: ContractProvider, via: Sender, value: bigint, message: Cell) {
        await provider.internal(via, {
            value: value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: message,
        });
    }
}

export async function run(provider: NetworkProvider) {
    const LOCKER_ADDRESS = Address.parse('EQB78SZlzlvTqbqVnxVX4ZiyVuhwsFZnXCx1LiiX5UxuEwNw'); 
    const USER_WALLET_ADDRESS = Address.parse('UQDpc8tkuE8B83JZO7tDFPNKJWNDNJIzXmOFERns15nIzw5B'); 
    const JETTONS_TO_TRANSFER  = toNano(200000);

    const locker = provider.open(
        JettonLocker.createFromAddress( LOCKER_ADDRESS )
    );

    console.log('data', await locker.getData());
    
    const params = await locker.getData();
    const JETTON_MASTER_ADDRESS = params.jettonMasterAddress;
        
    const jettonMaster = provider.open(
        JettonMaster.create( JETTON_MASTER_ADDRESS )
    );
    const USER_JETTON_ADDRESS = await jettonMaster.getWalletAddress(USER_WALLET_ADDRESS);

    const jettonWallet = provider.open(
        SimpleContract.createFromAddress(USER_JETTON_ADDRESS)
    );

    const cell = beginCell().storeUint(0xf8a7ea5, 32).storeUint(0, 64) // op, queryId
                      .storeCoins(JETTONS_TO_TRANSFER).storeAddress(LOCKER_ADDRESS)
                      .storeAddress(USER_WALLET_ADDRESS)
                      .storeMaybeRef(null)
                      .storeCoins(toNano(1))
                      .storeMaybeRef(null)
                 .endCell();

    await jettonWallet.sendSimpleMessage(provider.sender(), toNano('1.05'), cell);
}

