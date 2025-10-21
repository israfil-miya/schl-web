import ZeroBounceSDK from '@zerobounce/zero-bounce-sdk';

const zeroBounce = new ZeroBounceSDK();

zeroBounce.init(process.env.ZERO_BOUNCE_API_KEY || '');

export { zeroBounce };
