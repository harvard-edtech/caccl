import express from 'express';
/**
 * Grade passback request body
 * @author Gabe Abrams
 */
type ServerPassbackRequest = {
    req: express.Request;
    text?: string;
    url?: string;
    score?: number;
    percent?: number;
    submittedAt?: (Date | string);
};
export default ServerPassbackRequest;
