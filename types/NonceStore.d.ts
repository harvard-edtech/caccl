/**
 * Interface for a nonce store
 * @author Gabe Abrams
 */
interface NonceStore {
    /**
     * Checks if a new nonce is valid, mark it as used
     * @author Gabe Abrams
     * @param nonce OAuth nonce
     * @param timestampSecs OAuth timestamp in seconds
     * @returns Promise that resolves if nonce is valid, rejects with error if
     *   nonce is invalid.
     */
    check(nonce: string, timestampSecs: number): Promise<undefined>;
}
export default NonceStore;
