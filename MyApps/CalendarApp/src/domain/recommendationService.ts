import { Activity, AppFilters, DemoUser, Recommendation, TimeSlot } from './types';

const budgetRank: Record<string, number> = { low: 1, medium: 2, high: 3, any: 99 };

export const recommendActivities = (params: {
  activities: Activity[];
  slot: TimeSlot;
  groupSize: number;
  location: string;
  filters: AppFilters;
  organizer: DemoUser;
  friends: DemoUser[];
}) => {
  const people = [params.organizer, ...params.friends];
  const availableMinutes = params.slot.durationMinutes;

  const results: Recommendation[] = params.activities
    .filter((activity) => activity.durationMinutes <= availableMinutes)
    .filter((activity) => activity.minParticipants <= params.groupSize && activity.maxParticipants >= params.groupSize)
    .filter((activity) => params.filters.budget === 'any' || budgetRank[activity.costLevel] <= budgetRank[params.filters.budget])
    .filter((activity) => !params.filters.category || activity.category === params.filters.category)
    .filter((activity) => !params.filters.interest || activity.interestTags.includes(params.filters.interest!))
    .filter((activity) => activity.location === params.location)
    .map((activity) => {
      const sharedInterests = new Set(people.flatMap((person) => person.interests.filter((interest) => activity.interestTags.includes(interest))));
      let score = sharedInterests.size * 10;
      const reasons = [sharedInterests.size ? `matches ${sharedInterests.size} shared interests` : 'no direct interest overlap'];
      score += 5;
      reasons.push('fits selected location');
      score += budgetRank[params.filters.budget] === 99 || budgetRank[activity.costLevel] <= budgetRank[params.filters.budget] ? 4 : 0;
      reasons.push(`fits ${activity.costLevel} budget`);
      score += Math.max(1, Math.round((availableMinutes - activity.durationMinutes) / 15));
      return { ...activity, score, reasons };
    })
    .sort((a, b) => b.score - a.score);

  return { recommendations: results, reason: results.length ? undefined : 'No activities matched the selected slot, location, or budget constraints.' };
};
