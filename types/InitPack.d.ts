import APIStructure from '../../types/API';
import VisitEndpointFunc from './VisitEndpointFunc';
/**
 * Arguments required for initializing an endpoint category
 * @author Gabe Abrams
 */
type InitPack = {
    visitEndpoint: VisitEndpointFunc;
    api: APIStructure;
    defaultCourseId?: number;
};
export default InitPack;
