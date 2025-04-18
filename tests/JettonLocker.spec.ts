import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { JettonLocker } from '../wrappers/JettonLocker';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('JettonLocker', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('JettonLocker');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let jettonLocker: SandboxContract<JettonLocker>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        jettonLocker = blockchain.openContract(JettonLocker.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await jettonLocker.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: jettonLocker.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and jettonLocker are ready to use
    });
});
