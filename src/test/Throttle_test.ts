import { assert }     from 'chai';
import { Throttle }   from '../lib/Throttle';
import { IThreshold } from '../meta/interfaces';
import { Threshold }  from '../lib/Threshold';

import { sThrottleThresholdOptions } from '../meta/structs';
import {
    IRequestable,
    RES,
    sRequestConstructorArgs,
    sTransfer,
}                                    from '@ragent/cross-types';


describe('Throttle', () => {

    const TO_MILL: number = 1e6;

    const path: string                         = '/';
    const requestOptions: any                  = {};
    const responseTimeout: number              = 2000;
    const transferTimeout: number              = 2000;
    const requestArgs: sRequestConstructorArgs = {
        headers         : { ':path' : path },
        options         : requestOptions,
        responseTimeout : responseTimeout,
        transferTimeout : transferTimeout,
    };


    const dummy: sTransfer = {
        responseHeaders : undefined,
        body            : Buffer.from(''),
        stats           : {
            utc_startTime           : new Date(),
            status                  : 0,
            bytes                   : 0,
            response_micro_duration : 0,
            transfer_micro_duration : 0,
        },
    };



    class Moc_Req_Session implements IRequestable {
        // @ts-ignore
        public request( {
                            headers,
                            options,
                            responseTimeout,
                            transferTimeout,
                        }: sRequestConstructorArgs ): Promise<sTransfer> {

            return new Promise(( res: RES<sTransfer> ): void => {
                setImmediate(() => res(dummy));
            });

        }
    }



    it('pauses between requests', async () => {
        const threshOptions: sThrottleThresholdOptions = {
            maxTotalReqs    : 4,
            minReqPause     : 300,
            maxReqPause     : 300,
            minSleepMS      : 5000,
            maxSleepMS      : 5000,
            maxReqsPerSleep : 2,
            minReqsPerSleep : 2,
        };

        const thresholds: IThreshold = new Threshold(threshOptions);

        const T: Throttle    = new Throttle(new Moc_Req_Session(),
                                            thresholds);
        const before: number = Date.now();
        // first request does invoke a pause
        // so we call twice so that we can messure the second call
        // this also should verify that the first call does not invoke a pause
        await T.request(requestArgs);
        await T.request(requestArgs);
        const diff: number  = Date.now() - before;
        const elaps: number = diff;
        assert.isAtLeast(elaps, threshOptions.minReqPause);
        assert.isBelow(elaps, threshOptions.maxReqPause * 2);
    });

    it('does not sleep when at or below request threshold for sleep', async () => {
        const threshOptions: sThrottleThresholdOptions = {
            maxTotalReqs    : 4,
            minReqPause     : 0,
            maxReqPause     : 0,
            minSleepMS      : 5000,
            maxSleepMS      : 5000,
            maxReqsPerSleep : 1,
            minReqsPerSleep : 1,
        };

        const thresholds: IThreshold = new Threshold(threshOptions);

        const T: Throttle                = new Throttle(new Moc_Req_Session(),
                                                        thresholds);
        const before: [ number, number ] = process.hrtime();
        await T.request(requestArgs);
        const diff: [ number, number ] = process.hrtime(before);
        const elaps: number            = (diff[ 0 ] * 1e9 + diff[ 1 ]) / TO_MILL;
        assert.isBelow(elaps, threshOptions.minSleepMS);
    });

    it('sleeps when over threshold for sleep', async () => {
        const threshOptions: sThrottleThresholdOptions = {
            maxTotalReqs    : 4,
            minReqPause     : 0,
            maxReqPause     : 0,
            minSleepMS      : 300,
            maxSleepMS      : 300,
            maxReqsPerSleep : 1,
            minReqsPerSleep : 1,
        };

        const thresholds: IThreshold = new Threshold(threshOptions);

        const T: Throttle = new Throttle(new Moc_Req_Session(), thresholds);
        // call request number of times so that the next call will cause a sleep

        // set timer here because this is the call were are interested in
        const before: [ number, number ] = process.hrtime();
        await T.request(requestArgs);
        await T.request(requestArgs);
        const diff: [ number, number ] = process.hrtime(before);
        const elaps: number            = (diff[ 0 ] * 1e9 + diff[ 1 ]) / TO_MILL;
        assert.isAtLeast(elaps, threshOptions.minSleepMS);
        assert.isBelow(elaps, threshOptions.maxSleepMS * 2);
    });

    it('resets sleep threshold count after a sleep', async () => {
        const threshOptions: sThrottleThresholdOptions = {
            maxTotalReqs    : 4,
            minReqPause     : 0,
            maxReqPause     : 0,
            minSleepMS      : 300,
            maxSleepMS      : 300,
            maxReqsPerSleep : 1,
            minReqsPerSleep : 1,
        };

        const thresholds: IThreshold = new Threshold(threshOptions);

        const T: Throttle = new Throttle(new Moc_Req_Session(), thresholds);
        // call request number of times so that the next call will cause a sleep
        // set timer here because the next call should cause a sleep
        const before: [ number, number ] = process.hrtime();
        await T.request(requestArgs);
        await T.request(requestArgs);
        await T.request(requestArgs);

        const diff: [ number, number ] = process.hrtime(before);
        const elaps: number            = (diff[ 0 ] * 1e9 + diff[ 1 ]) / TO_MILL;
        assert.isAtLeast(elaps, threshOptions.minSleepMS);
        assert.isBelow(elaps, threshOptions.maxSleepMS * 2);
    });

    it('throws when maximum total requests has been made', async () => {
        const threshOptions: sThrottleThresholdOptions = {
            maxTotalReqs    : 1,
            minReqPause     : 0,
            maxReqPause     : 0,
            minSleepMS      : 500,
            maxSleepMS      : 500,
            maxReqsPerSleep : 2,
            minReqsPerSleep : 2,
        };
        const thresholds: IThreshold                   = new Threshold(threshOptions);

        const T: Throttle = new Throttle(new Moc_Req_Session(), thresholds);
        try {
            await T.request(requestArgs);
            assert.isTrue(false, 'did not throw');
        } catch ( e ) {
            assert.equal(e.message, 'Max Requests');
        }

    });

});