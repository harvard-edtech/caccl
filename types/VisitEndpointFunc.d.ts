import APIConfig from './APIConfig';
/**
 * Visit endpoint function type definition
 * @author Gabe Abrams
 */
declare type VisitEndpointFunc = ((opts: {
    path: string;
    method: ('GET' | 'POST' | 'PUT' | 'DELETE');
    action: string;
    params?: {
        [k: string]: any;
    };
    config?: APIConfig;
    pagePostProcessor?: (page: any, pageNumber: number) => any;
}) => Promise<any>);
export default VisitEndpointFunc;
