export const createInstance = <TValue>(storeFactory: new () => TValue): TValue => new storeFactory();
