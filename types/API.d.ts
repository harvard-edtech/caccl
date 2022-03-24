import ECatAccount from '../endpoints/ECatAccount';
import ECatConversation from '../endpoints/ECatConversation';
import ECatCourse from '../endpoints/ECatCourse';
import ECatOther from '../endpoints/ECatOther';
import ECatUser from '../endpoints/ECatUser';
/**
 * API structure type
 * @author Gabe Abrams
 */
interface API {
    account: ECatAccount;
    course: ECatCourse;
    conversation: ECatConversation;
    other: ECatOther;
    user: ECatUser;
}
export default API;
