/**
 * Parsed Canvas Student Analysis Quiz Report
 * @author Gabe Abrams
 */
type CanvasParsedStudentAnalysisQuizReport = {
    quizId: number;
    questions: {
        questionId: number;
        questionText: string;
    }[];
    studentReports: {
        userId: number;
        userFullName: string;
        submittedAt: number;
        score: number;
        numCorrect: number;
        numIncorrect: number;
        attempt: number;
        responses: {
            questionId: number;
            response: string;
            points: number;
        }[];
    }[];
};
export default CanvasParsedStudentAnalysisQuizReport;
