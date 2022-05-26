import AssignmentDescription from './AssignmentDescription';
import LaunchType from './LaunchType';
import OutcomeDescription from './OutcomeDescription';
/**
 * Shared launch info (independent of launch type)
 * @author Gabe Abrams
 */
interface SharedLaunchInfo {
    timestamp: number;
    canvasHost: string;
    courseId: number;
    sisCourseId: string;
    userId: number;
    userLoginId: string;
    userFirstName: string;
    userLastName: string;
    userFullName: string;
    userEmail: string;
    userImage: string;
    isAdmin: boolean;
    isInstructor: boolean;
    isTA: boolean;
    isDesigner: boolean;
    isCreditLearner: boolean;
    isNonCreditLearner: boolean;
    isLearner: boolean;
    isTTM: boolean;
    notInCourse: boolean;
    extRoles: string[];
    customParams: {
        [k: string]: any;
    };
    contextId: string;
    contextLabel: string;
    enrollmentState: string;
    workflowState: string;
    launchPresentationTarget: string;
    iframeWidth?: number;
    iframeHeight?: number;
    locale: string;
    returnURL: string;
    roles: string[];
    canvasInstance: string;
    resourceLinkId: string;
    originalLTILaunchBody: {
        [k in string]: any;
    };
    consumerKey: string;
}
/**
 * Type for launch info that's added to user's session
 * @author Gabe Abrams
 */
declare type LaunchInfo = ({
    launchType: LaunchType.Assignment;
    assignment?: AssignmentDescription;
    outcome?: OutcomeDescription;
} | {
    launchType: LaunchType.Navigation;
    launchAppTitle?: string;
}) & SharedLaunchInfo;
export default LaunchInfo;
