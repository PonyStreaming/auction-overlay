export function reverse<T>(a: T[]): T[] {
    const r = new Array<T>(a.length);
    for (let i = 0; i < a.length; i++) {
        r[a.length-i-1] = a[i];
    }
    return r;
}
