import { EventEmitter }                                     from 'events';
import { IThreshold, IThrottleAgent }                       from '../meta/interfaces';
import { IRequestable, sRequestConstructorArgs, sTransfer } from '@ragent/cross-types';
import { RES }                                              from 'res-rej-types';



export class Throttle extends EventEmitter implements IThrottleAgent {
  private static delay( ms: number ): Promise<boolean> {
    return new Promise<boolean>(( res: RES<boolean> ): void => {
      setTimeout(() => res(true), ms);
    });
  }


  public async request( args: sRequestConstructorArgs ): Promise<sTransfer> {
    try {
      switch ( true ) {
        case this.shouldSleep: {
          const sleepDelay: number = this.sleepDelay;
          this.emit(THROTTLE_EVENTS.SLEEP);
          await Throttle.delay(sleepDelay);
          this.emit(THROTTLE_EVENTS.AWAKE);
          this.reqCnt = - 1;
        }
          break;
        case this.shouldDelayReq: {
          const reqDelay = this.reqDelay;
          this.emit(THROTTLE_EVENTS.DELAY);
          await Throttle.delay(reqDelay);
          this.emit(THROTTLE_EVENTS.RESUME);
        }
          break;
      }
      this.reqCnt += 1;
      return this.session.request(args);
    } catch ( e ) {
      if( e.message === this.maxRequestsMessage ) {
        this.emit(THROTTLE_EVENTS.MAX_REQUESTS);
      } else {
        this.emit(THROTTLE_EVENTS.ERROR, e);
      }
      throw e;
    }
  }


  public constructor( session: IRequestable, thresholds: IThreshold ) {
    super();
    this.session    = session;
    this.thresholds = thresholds;
  }


  private session: IRequestable;
  private thresholds: IThreshold;
  private lastReqTime: number  = 0;
  private _reqCnt: number      = 0;
  private _totalReqCnt: number = 0;


  private get maxRequestsMessage(): string {
    return 'Max Requests';
  }


  private get totalReqCnt(): number {
    return this._totalReqCnt;
  }


  private set totalReqCnt( x: number ) {
    this._totalReqCnt = x;
    if( this.totalReqCnt >= this.thresholds.maxTotalReqs ) {
      throw new Error(this.maxRequestsMessage);
    }
  }


  private get reqCnt(): number {
    return this._reqCnt;
  }


  private set reqCnt( cnt: number ) {
    if( cnt > this._reqCnt ) {
      this.totalReqCnt = this.totalReqCnt + 1;
    }
    this._reqCnt     = cnt;
    this.lastReqTime = Date.now();
  }


  private get sleepDelay(): number {
    return this.thresholds.sleepDelay;
  }


  private get reqDelay(): number {
    return this.thresholds.reqDelay;
  }


  private get shouldDelayReq(): boolean {
    return this.thresholds.shouldDelayReq(this.lastReqTime);
  }


  private get shouldSleep(): boolean {
    return this.thresholds.shouldSleep(this.reqCnt);
  }
}

