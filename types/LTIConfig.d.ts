import express from 'express';
import InitCACCLStore from 'caccl-memory-store/lib/InitCACCLStore';
import InstallationCredentials from './InstallationCredentials';
import SelfLaunchConfig from './SelfLaunchConfig';
/**
 * Config options for caccl-lti
 * @author Gabe Abrams
 */
declare type LTIConfig = {
    app: express.Application;
    installationCredentials: InstallationCredentials;
    initNonceStore?: InitCACCLStore;
    selfLaunch?: SelfLaunchConfig;
    dontAuthorizeAfterLaunch?: boolean;
};
export default LTIConfig;
