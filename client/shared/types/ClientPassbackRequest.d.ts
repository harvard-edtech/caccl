/**
 * Grade passback request body
 * @author Gabe Abrams
 */
declare type ClientPassbackRequest = {
    text?: string;
    url?: string;
    score?: number;
    percent?: number;
    submittedAt?: (Date | string);
};
export default ClientPassbackRequest;
