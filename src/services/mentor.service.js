import { Mentor } from '../models/Mentor.js';
import { WorkshopMentor } from '../models/WorkshopMentor.js';
import { ApiError } from '../utils/apiError.js';

const createMentor = async (mentorData) => {
  return await Mentor.create(mentorData);
};

const getMentors = async (filters = {}) => {
  return await Mentor.find(filters).sort({ name: 1 });
};

const getMentorById = async (id) => {
  const mentor = await Mentor.findById(id);
  if (!mentor) throw new ApiError(404, 'Mentor not found');
  return mentor;
};

const linkMentorToWorkshop = async (opportunityId, mentorId) => {
  return await WorkshopMentor.findOneAndUpdate(
    { opportunityId, mentorId },
    { opportunityId, mentorId },
    { upsert: true, new: true }
  );
};

const getWorkshopMentors = async (opportunityId) => {
  const workshopMentors = await WorkshopMentor.find({ opportunityId }).populate('mentorId');
  return workshopMentors.map(wm => wm.mentorId);
};

export {
  createMentor,
  getMentors,
  getMentorById,
  linkMentorToWorkshop,
  getWorkshopMentors,
};
