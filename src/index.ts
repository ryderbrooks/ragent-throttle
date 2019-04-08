import { Throttle }                  from './lib/Throttle';
import { Threshold }                 from './lib/Threshold';
import { sThrottleThresholdOptions } from './meta/structs';
import { IThrottleAgent }            from './meta/interfaces';
import { interfaces }                from '@ragent/cross-types';
import IRequestable = interfaces.IRequestable;


export {IThrottleAgent} from './meta/interfaces';
export {sThrottleThresholdOptions} from './meta/structs';

export function throttleSession( session: IRequestable,
                                 thresholdOptions: sThrottleThresholdOptions ): IThrottleAgent {
    return new Throttle(session,
                        new Threshold(thresholdOptions));
}

