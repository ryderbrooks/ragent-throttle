import { IThreshold }                from '../meta/interfaces';
import { sThrottleThresholdOptions } from '..';


function randInt(min:number, max:number):number{
    return Math.floor(Math.random()*(max-min+1)+min );
}

export class Threshold implements IThreshold {
    constructor(thresholds:sThrottleThresholdOptions){
        this.thresholds = thresholds;
    }
    private thresholds: sThrottleThresholdOptions;

    get reqDelay():number{
        return randInt(this.thresholds.minReqPause, this.thresholds.maxReqPause);
    }
    get sleepDelay():number{
        return randInt(this.thresholds.minSleepMS, this.thresholds.maxSleepMS);
    }

    get maxTotalReqs():number{
        return this.thresholds.maxTotalReqs;
    }

    shouldDelayReq(lastReqTime:number):boolean{
        return Date.now() - lastReqTime < this.reqDelay;
    }

    shouldSleep(reqCnt: number):boolean{
        return reqCnt >= randInt(this.thresholds.minReqsPerSleep,
                                this.thresholds.maxReqsPerSleep);
    }
}


