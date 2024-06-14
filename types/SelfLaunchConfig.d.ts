import InitCACCLStore from 'caccl-memory-store/lib/InitCACCLStore';
/**
 * Configuration for self launches
 * @author Gabe Abrams
 */
type SelfLaunchConfig = {
    initAppIdStore?: InitCACCLStore;
    hostAppIdMap?: {
        [k: string]: number;
    };
    courseAppIdMap?: {
        [k: string]: {
            [k: number]: number;
        };
    };
    adminAccessTokenMap?: {
        [k: string]: string[];
    };
    defaultCanvasHost?: string;
};
export default SelfLaunchConfig;
