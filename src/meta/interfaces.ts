import { IRequestable } from '@ragent/cross-types';



export interface IThreshold {
    reqDelay: number;
    sleepDelay: number;
    maxTotalReqs: number;

    shouldDelayReq( lastReqTime: number ): boolean;

    shouldSleep( reqCnt: number ): boolean;
}



export interface IThrottleAgent extends IRequestable {
    emit( event: THROTTLE_EVENTS.SLEEP | THROTTLE_EVENTS.DELAY | THROTTLE_EVENTS.AWAKE | THROTTLE_EVENTS.RESUME,
          data: any ): boolean;

    on( event: THROTTLE_EVENTS.SLEEP | THROTTLE_EVENTS.DELAY | THROTTLE_EVENTS.AWAKE | THROTTLE_EVENTS.RESUME,
        listener: ( data: any ) => void ): this;
}

