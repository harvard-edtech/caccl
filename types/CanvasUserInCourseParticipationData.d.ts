interface CanvasStudentInCourseParticipationData {
    page_views: {
        [k: string]: number;
    };
    participations: ({
        created_at: string;
        url: string;
    })[];
}
export default CanvasStudentInCourseParticipationData;
