
const enum THROTTLE_EVENTS {
    SLEEP = 'throttleSleep',
    WAKE = 'throttleWake',
    DELAY = 'throttleDelay',
    AWAKE = 'throttleSleepAwake',
    RESUME = 'throttleResume',
    ERROR = 'throttleAgentError',
    MAX_REQUESTS = 'throttleAgentMaxRequests',
    RESPONSE = 'throttleAgentResponse',
    AGENT_FREE = 'throttleAgentFree',

    SLEEP_SHORT = 'throttleSleepShort',
    SLEEP_LONG = 'throttleSleepLong',
    WAKE_SHORT = 'throttleWakeShort',
    WAKE_LONG = 'throttleWakeLong',
}