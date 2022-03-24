/**
 * Type for description of outcomes
 * @author Gabe Abrams
 */
interface OutcomeDescription {
    url: string;
    sourcedId: string;
    urlSubmissionAccepted: boolean;
    textSubmissionAccepted: boolean;
    totalScoreAccepted: boolean;
    submittedAtAccepted: boolean;
}
export default OutcomeDescription;
