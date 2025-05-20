// utils/matchingEngine.js

import haversine from 'haversine-distance';

/**
 * Check if a technician is free at the requested time.
 * @param {Date} requestedTime - When the job is to start.
 * @param {Array<{ startTime: string, endTime: string }>} currentJobs
 * @returns {boolean} True if no overlap with existing jobs.
 */
function isAvailable(requestedTime, currentJobs) {
  return !currentJobs.some(job => {
    const start = new Date(job.startTime);
    const end   = new Date(job.endTime);
    // Overlap check
    return requestedTime >= start && requestedTime <= end;
  });
}

/**
 * Match the best technician based on:
 *  - Required skill
 *  - Online status
 *  - Proximity (Haversine distance)
 *  - Availability (no overbooking)
 *  - Urgency (high priority reduces score)
 *
 * @param {{latitude: number, longitude: number}} clientLoc
 * @param {Array<Object>} technicians List of tech profiles from backend
 * @param {string} skill Required skill (e.g., 'plumbing')
 * @param {'high'|'normal'|'low'} urgency
 * @returns {Object|null} Best matching technician or null if none
 */
export function matchTechnician(clientLoc, technicians, skill, urgency) {
  const now = new Date();

  // 1. Filter techs by skill, online status, and daily capacity
  const eligible = technicians.filter(tech =>
    tech.skills.includes(skill) &&
    tech.isOnline &&
    tech.currentJobs.length < tech.maxDailyJobs &&
    isAvailable(now, tech.currentJobs)  // ensure no conflict right now
  );

  if (eligible.length === 0) {
    return null; // no one can take the job
  }

  // 2. Score each technician
  const scored = eligible.map(tech => {
    // 2a. Distance in kilometers
    const distMeters = haversine(clientLoc, tech.location);
    const distKm     = distMeters / 1000;

    // 2b. Calculate wait time until tech is free
    const lastJob = tech.currentJobs[tech.currentJobs.length - 1];
    const nextFree = lastJob ? new Date(lastJob.endTime) : now;
    const waitMins = Math.max(0, (nextFree - now) / 60000); // in minutes

    // 2c. Base score: distance + wait
    let score = distKm + waitMins;

    // 2d. Urgency modifier: reduce score for high urgency
    if (urgency === 'high') score *= 0.5;

    return { tech, score };
  });

  // 3. Sort by ascending score (lowest = best)
  scored.sort((a, b) => a.score - b.score);

  // 4. Return the top technician object
  return scored[0].tech;
}
