/**
 * Configuration for endpoint call
 * @author Gabe Abrams
 */
declare type APIConfig = {
    canvasHost?: string;
    accessToken?: string;
    numRetries?: number;
    itemsPerPage?: number;
    maxPages?: number;
    /**
     * Handler to call when a new page of data returns from Canvas
     * @param page data in the new page
     * @param pageNumber number of the page (starting at 1)
     */
    onNewPage?: (page: any, pageNumber: number) => void;
    authenticityToken?: string;
    pathPrefix?: string;
};
export default APIConfig;
