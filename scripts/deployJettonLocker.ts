import { Cell, toNano, Address } from '@ton/core';
import { JettonMaster } from '@ton/ton';
import { JettonLocker } from '../wrappers/JettonLocker';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const api    = provider.api()

    const lockerBillCode: Cell = await compile('JettonLockerBill');
    // deposits_end_time 1698019200 = 23 October 2023, 0:00:00 UTC
    // vesting_start_time 1760227200 = 12 October 2025, 0:00:00 UTC
    // vesting_total_duration = 93312000 seconds (~ 3 years)
    // unlock_period = 2592000 seconds (30 days)



    const START_TIME = 1744925181;  
    const DAY = 60 * 60 * 24;
    const HOUR = 60 * 60;
    const DEPOSITS_DURATION = DAY * 165; 
    const LOCK_DURATION = DAY; 
    const VESTING_START_TIME = START_TIME + DEPOSITS_DURATION + LOCK_DURATION;
    const VESTING_DURATION = DAY * 1; 
    const UNLOCK_PERIOD = DAY * 1; 
    const MIN_JETTON_DEPOSIT = toNano(1000000); 
    const JETTON_MASTER_ADDRESS = Address.parse(''); 


    const locker = provider.open(
        JettonLocker.createFromConfig(
            {
                depositsEndTime: START_TIME + DEPOSITS_DURATION,
                vestingStartTime: VESTING_START_TIME,
                vestingTotalDuration: VESTING_DURATION,
                unlockPeriod: UNLOCK_PERIOD,
                minJettonDeposit: MIN_JETTON_DEPOSIT,
                jettonMasterAddress: JETTON_MASTER_ADDRESS,
                billCode: lockerBillCode,
            },
            await compile('JettonLocker')
        )
    );

    await locker.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(locker.address);

    console.log('data', await locker.getData());
}
