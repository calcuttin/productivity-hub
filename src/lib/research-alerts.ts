import { prisma } from '@/lib/prisma';
import { 
  createNotification, 
  substituteTemplateVariables, 
  isInQuietHours,
  getUserNotificationSettings 
} from '@/lib/notifications';

// Research deadline types for different academic milestones
export const RESEARCH_DEADLINE_TYPES = {
  'submission': 'Submission Deadline',
  'review': 'Review Deadline', 
  'conference': 'Conference Deadline',
  'publication': 'Publication Deadline',
  'presentation': 'Presentation Deadline',
  'funding': 'Funding Application Deadline',
  'abstract': 'Abstract Submission',
  'revision': 'Revision Deadline',
  'peer_review': 'Peer Review Deadline',
  'follow_up': 'Follow-up Reminder'
} as const;

export type ResearchDeadlineType = keyof typeof RESEARCH_DEADLINE_TYPES;

// Research reminder timing options
export const RESEARCH_REMINDER_TIMINGS = {
  '2_weeks': 336, // 14 * 24 hours
  '1_week': 168, // 7 * 24 hours
  '3_days': 72,
  '1_day': 24,
  '12_hours': 12,
  '6_hours': 6,
  '2_hours': 2,
  '1_hour': 1
} as const;

export type ResearchReminderTiming = keyof typeof RESEARCH_REMINDER_TIMINGS;

// Research paper status for tracking progress
export const RESEARCH_STATUS_TYPES = {
  'planning': 'Planning',
  'researching': 'Researching',
  'writing': 'Writing',
  'reviewing': 'Under Review',
  'revising': 'Revising',
  'accepted': 'Accepted',
  'published': 'Published',
  'rejected': 'Rejected',
  'on_hold': 'On Hold'
} as const;

export type ResearchStatus = keyof typeof RESEARCH_STATUS_TYPES;

// Interface for research deadlines (stored in research paper notes or separate model)
interface ResearchDeadline {
  id: string;
  type: ResearchDeadlineType;
  title: string;
  description?: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reminderTimings: ResearchReminderTiming[];
  completed: boolean;
  venue?: string; // Conference, journal, etc.
  submissionUrl?: string;
  notes?: string;
}

// Get research papers with upcoming deadlines
export async function getResearchPapersWithDeadlines(userId: string, daysAhead = 30) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + daysAhead);
  
  const papers = await prisma.researchPaper.findMany({
    where: {
      userId,
      updatedAt: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Active in last 90 days
      }
    },
    include: {
      authors: true,
      citations: true
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });
  
  // Filter papers that might have deadlines in their notes or need follow-ups
  return papers.filter(paper => {
    // Check if paper has deadline keywords in notes or title
    const searchText = `${paper.title} ${paper.notes || ''}`.toLowerCase();
    const hasDeadlineKeywords = [
      'deadline', 'due', 'submit', 'conference', 'journal', 'review', 'revision'
    ].some(keyword => searchText.includes(keyword));
    
    return hasDeadlineKeywords || paper.updatedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  });
}

// Extract potential deadlines from research paper content
export function extractPotentialDeadlines(paper: any): ResearchDeadline[] {
  const deadlines: ResearchDeadline[] = [];
  const text = `${paper.title} ${paper.notes || ''}`.toLowerCase();
  
  // Look for date patterns and deadline keywords
  const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|[a-zA-Z]+ \d{1,2},? \d{4})/g;
  const deadlineKeywords = /(?:deadline|due|submit|conference|review|revision).*?(?:date|by|on)\s*:?\s*([^\n\.]+)/gi;
  
  const matches = text.match(deadlineKeywords);
  if (matches) {
    matches.forEach((match, index) => {
      const dateMatch = match.match(dateRegex);
      if (dateMatch) {
        try {
          const deadline = new Date(dateMatch[0]);
          if (deadline > new Date()) {
            deadlines.push({
              id: `extracted_${paper.id}_${index}`,
              type: detectDeadlineType(match),
              title: `${RESEARCH_DEADLINE_TYPES[detectDeadlineType(match)]} - ${paper.title}`,
              deadline,
              priority: 'medium',
              reminderTimings: ['1_week', '1_day'],
              completed: false,
              venue: paper.publication || undefined
            });
          }
        } catch (error) {
          // Invalid date format, skip
        }
      }
    });
  }
  
  return deadlines;
}

// Detect deadline type from text context
function detectDeadlineType(text: string): ResearchDeadlineType {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('submission') || lowerText.includes('submit')) return 'submission';
  if (lowerText.includes('review')) return 'review';
  if (lowerText.includes('conference')) return 'conference';
  if (lowerText.includes('publication') || lowerText.includes('publish')) return 'publication';
  if (lowerText.includes('presentation') || lowerText.includes('present')) return 'presentation';
  if (lowerText.includes('funding') || lowerText.includes('grant')) return 'funding';
  if (lowerText.includes('abstract')) return 'abstract';
  if (lowerText.includes('revision') || lowerText.includes('revise')) return 'revision';
  if (lowerText.includes('peer')) return 'peer_review';
  
  return 'submission'; // Default
}

// Analyze research progress and suggest follow-ups
export async function analyzeResearchProgress(userId: string) {
  const papers = await prisma.researchPaper.findMany({
    where: {
      userId
    },
    include: {
      authors: true,
      citations: true
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });
  
  // Get time sessions for research papers separately (if available)
  let recentTimeSessions: any[] = [];
  try {
    // TODO: Uncomment after Prisma client regeneration
    // recentTimeSessions = await prisma.timeSession.findMany({
    //   where: {
    //     userId,
    //     activityType: 'research',
    //     researchId: {
    //       in: papers.map(p => p.id)
    //     }
    //   },
    //   orderBy: {
    //     startTime: 'desc'
    //   },
    //   take: 50
    // });
  } catch (error) {
    // Time sessions not available yet, use paper updatedAt only
  }
  
  const analysis = {
    totalPapers: papers.length,
    recentlyActive: 0,
    stagnant: 0,
    needsAttention: [] as any[],
    suggestions: [] as string[]
  };
  
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  papers.forEach(paper => {
    // Find the most recent time session for this paper
    const paperTimeSessions = recentTimeSessions.filter((ts: any) => ts.researchId === paper.id);
    const lastTimeSession = paperTimeSessions[0];
    
    const lastActivity = lastTimeSession?.startTime || paper.updatedAt;
    const daysSinceActivity = Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));
    
    if (new Date(lastActivity) > twoWeeksAgo) {
      analysis.recentlyActive++;
    } else if (new Date(lastActivity) < oneMonthAgo) {
      analysis.stagnant++;
      analysis.needsAttention.push({
        paper,
        daysSinceActivity,
        reason: daysSinceActivity > 60 ? 'Long-term stagnation' : 'Recent inactivity'
      });
    }
  });
  
  // Generate suggestions
  if (analysis.stagnant > 0) {
    analysis.suggestions.push(`You have ${analysis.stagnant} research paper(s) that haven't been updated recently.`);
  }
  
  if (analysis.needsAttention.length > 0) {
    analysis.suggestions.push('Consider setting deadlines for stagnant research projects.');
  }
  
  return analysis;
}

// Send research deadline reminder
export async function sendResearchDeadlineReminder(
  userId: string,
  paperId: string,
  paperTitle: string,
  deadline: ResearchDeadline,
  hoursUntilDeadline: number
) {
  const settings = await getUserNotificationSettings(userId);
  if (!settings?.researchNotifications) return;
  
  // Don't send if it's in quiet hours
  if (isInQuietHours(settings)) return;
  
  const urgencyLevel = getUrgencyLevel(hoursUntilDeadline);
  const templateData = {
    paperTitle,
    deadlineType: RESEARCH_DEADLINE_TYPES[deadline.type],
    deadlineDate: deadline.deadline.toLocaleDateString(),
    deadlineTime: deadline.deadline.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }),
    timeRemaining: getTimeRemainingText(hoursUntilDeadline),
    venue: deadline.venue || 'N/A',
    priority: deadline.priority
  };
  
  await createNotification({
    userId,
    title: substituteTemplateVariables('📚 Research Deadline: {{deadlineType}}', templateData),
    message: substituteTemplateVariables('{{paperTitle}} - {{deadlineType}} due {{deadlineDate}} at {{deadlineTime}} ({{timeRemaining}} remaining)', templateData),
    type: 'research',
    priority: urgencyLevel,
    entityType: 'research',
    entityId: paperId,
    actionType: 'view',
    actionUrl: `/research/${paperId}`,
    scheduledFor: new Date(),
    expiresAt: deadline.deadline
  });
}

// Send research follow-up reminder
export async function sendResearchFollowUpReminder(
  userId: string,
  paperId: string,
  paperTitle: string,
  daysSinceActivity: number
) {
  const settings = await getUserNotificationSettings(userId);
  if (!settings?.researchNotifications) return;
  
  let title = '';
  let message = '';
  let priority = 'low';
  
  if (daysSinceActivity <= 7) {
    title = '📖 Research Check-in';
    message = `How's your progress on "${paperTitle}"? Consider scheduling some research time.`;
    priority = 'low';
  } else if (daysSinceActivity <= 21) {
    title = '🔍 Research Follow-up';
    message = `It's been ${daysSinceActivity} days since you worked on "${paperTitle}". Time to dive back in?`;
    priority = 'medium';
  } else if (daysSinceActivity <= 60) {
    title = '⚠️ Research Attention Needed';
    message = `"${paperTitle}" hasn't been updated in ${daysSinceActivity} days. Consider setting a deadline or archiving if no longer relevant.`;
    priority = 'medium';
  } else {
    title = '🚨 Stagnant Research Project';
    message = `"${paperTitle}" has been inactive for over 2 months. Review its status and consider next steps.`;
    priority = 'high';
  }
  
  await createNotification({
    userId,
    title,
    message,
    type: 'research',
    priority,
    entityType: 'research',
    entityId: paperId,
    actionType: 'view',
    actionUrl: `/research/${paperId}`,
    scheduledFor: new Date()
  });
}

// Send research milestone notification
export async function sendResearchMilestone(
  userId: string,
  paperId: string,
  paperTitle: string,
  milestone: string
) {
  const settings = await getUserNotificationSettings(userId);
  if (!settings?.enableNotifications) return;
  
  const milestones = {
    'first_paper': '🎉 First Research Paper!',
    'paper_published': '📚 Paper Published!',
    'citation_received': '📝 Citation Received!',
    'collaboration_started': '🤝 New Collaboration!',
    'conference_accepted': '🎯 Conference Acceptance!',
    'peer_review_completed': '✅ Peer Review Completed!'
  };
  
  const title = milestones[milestone as keyof typeof milestones] || '🏆 Research Milestone!';
  
  await createNotification({
    userId,
    title,
    message: `Congratulations on your research milestone with "${paperTitle}"!`,
    type: 'achievement',
    priority: 'medium',
    entityType: 'research',
    entityId: paperId,
    actionType: 'view',
    actionUrl: `/research/${paperId}`,
    scheduledFor: new Date()
  });
}

// Process research alerts for a specific user
export async function processResearchAlerts(userId: string) {
  try {
    const papers = await getResearchPapersWithDeadlines(userId);
    
    // Process deadline reminders
    for (const paper of papers) {
      const deadlines = extractPotentialDeadlines(paper);
      
      for (const deadline of deadlines) {
        const hoursUntilDeadline = (deadline.deadline.getTime() - Date.now()) / (1000 * 60 * 60);
        
        // Send reminders based on timing preferences
        for (const timing of deadline.reminderTimings) {
          const reminderHours = RESEARCH_REMINDER_TIMINGS[timing];
          
          if (hoursUntilDeadline > 0 && hoursUntilDeadline <= reminderHours + 1) {
            // TODO: Uncomment after Prisma client regeneration
            // const existingReminder = await prisma.notification.findFirst({
            //   where: {
            //     userId,
            //     entityType: 'research',
            //     entityId: paper.id,
            //     type: 'research',
            //     message: { contains: deadline.type },
            //     createdAt: {
            //       gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            //     }
            //   }
            // });
            const existingReminder = null; // Placeholder
            
            if (!existingReminder) {
              await sendResearchDeadlineReminder(
                userId,
                paper.id,
                paper.title,
                deadline,
                hoursUntilDeadline
              );
            }
          }
        }
      }
    }
    
    // Analyze and send follow-up reminders
    const analysis = await analyzeResearchProgress(userId);
    
    for (const item of analysis.needsAttention) {
      // TODO: Uncomment after Prisma client regeneration
      // const existingFollowUp = await prisma.notification.findFirst({
      //   where: {
      //     userId,
      //     entityType: 'research',
      //     entityId: item.paper.id,
      //     type: 'research',
      //     message: { contains: 'progress' },
      //     createdAt: {
      //       gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      //     }
      //   }
      // });
      const existingFollowUp = null; // Placeholder
      
      if (!existingFollowUp) {
        await sendResearchFollowUpReminder(
          userId,
          item.paper.id,
          item.paper.title,
          item.daysSinceActivity
        );
      }
    }
    
    // Check for research milestones (simplified logic)
    const recentPapers = papers.filter(p => 
      new Date(p.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
    );
    
    if (recentPapers.length > 0 && papers.length === 1) {
      await sendResearchMilestone(userId, recentPapers[0].id, recentPapers[0].title, 'first_paper');
    }
    
  } catch (error) {
    console.error(`Error processing research alerts for user ${userId}:`, error);
    throw error;
  }
}

// Process research alerts for all users
export async function processAllResearchAlerts() {
  const users = await prisma.user.findMany({
    where: {
      researchPapers: {
        some: {} // Only users who have at least one research paper
      }
    },
    select: { id: true, email: true }
  });
  
  const results = {
    processed: 0,
    errors: 0,
    details: [] as Array<{ userId: string; status: 'success' | 'error'; error?: string }>
  };
  
  for (const user of users) {
    try {
      await processResearchAlerts(user.id);
      results.processed++;
      results.details.push({ userId: user.id, status: 'success' });
    } catch (error) {
      results.errors++;
      results.details.push({
        userId: user.id,
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  return results;
}

// Schedule research deadline reminder
export async function scheduleResearchDeadlineReminder(
  userId: string,
  paperId: string,
  paperTitle: string,
  deadline: ResearchDeadline
) {
  // Schedule reminders for each timing preference
  for (const timing of deadline.reminderTimings) {
    const reminderTime = new Date(deadline.deadline);
    reminderTime.setHours(reminderTime.getHours() - RESEARCH_REMINDER_TIMINGS[timing]);
    
    if (reminderTime > new Date()) {
      await sendResearchDeadlineReminder(
        userId,
        paperId,
        paperTitle,
        deadline,
        RESEARCH_REMINDER_TIMINGS[timing]
      );
    }
  }
}

// Helper functions
function getUrgencyLevel(hoursUntilDeadline: number): string {
  if (hoursUntilDeadline <= 6) return 'urgent';
  if (hoursUntilDeadline <= 24) return 'high';
  if (hoursUntilDeadline <= 72) return 'medium';
  return 'low';
}

function getTimeRemainingText(hours: number): string {
  if (hours < 1) {
    const minutes = Math.floor(hours * 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else if (hours < 24) {
    const roundedHours = Math.floor(hours);
    return `${roundedHours} hour${roundedHours !== 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
}

// Parse deadline from natural language text
export function parseDeadlineFromText(text: string): Date | null {
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,  // MM/DD/YYYY or MM-DD-YYYY
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,    // YYYY/MM/DD or YYYY-MM-DD
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i,
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})/i
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        const date = new Date(match[0]);
        if (date > new Date()) {
          return date;
        }
      } catch (error) {
        continue;
      }
    }
  }
  
  return null;
} 