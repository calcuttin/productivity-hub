import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { 
  processResearchAlerts,
  processAllResearchAlerts,
  getResearchPapersWithDeadlines,
  analyzeResearchProgress,
  extractPotentialDeadlines,
  scheduleResearchDeadlineReminder,
  parseDeadlineFromText,
  RESEARCH_DEADLINE_TYPES,
  RESEARCH_REMINDER_TIMINGS,
  type ResearchDeadlineType,
  type ResearchReminderTiming
} from '@/lib/research-alerts';

// GET /api/research-alerts - Get research alert insights for current user
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    // Get research papers with potential deadlines
    const papers = await getResearchPapersWithDeadlines(user.id, 30);
    
    // Analyze research progress
    const progressAnalysis = await analyzeResearchProgress(user.id);
    
    // Extract all potential deadlines
    const allDeadlines = papers.flatMap(paper => 
      extractPotentialDeadlines(paper).map(deadline => ({
        ...deadline,
        paperId: paper.id,
        paperTitle: paper.title
      }))
    );
    
    // Sort deadlines by urgency
    const upcomingDeadlines = allDeadlines
      .filter(d => d.deadline > new Date())
      .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
      .slice(0, 10);
    
    // Calculate statistics
    const stats = {
      totalPapers: progressAnalysis.totalPapers,
      recentlyActive: progressAnalysis.recentlyActive,
      stagnant: progressAnalysis.stagnant,
      needsAttention: progressAnalysis.needsAttention.length,
      upcomingDeadlines: upcomingDeadlines.length,
      urgentDeadlines: upcomingDeadlines.filter(d => {
        const hoursUntil = (d.deadline.getTime() - Date.now()) / (1000 * 60 * 60);
        return hoursUntil <= 72; // 3 days or less
      }).length
    };
    
    return NextResponse.json({
      stats,
      upcomingDeadlines,
      needsAttention: progressAnalysis.needsAttention.slice(0, 5), // Top 5 papers needing attention
      suggestions: progressAnalysis.suggestions,
      deadlineTypes: Object.keys(RESEARCH_DEADLINE_TYPES),
      reminderTimings: Object.keys(RESEARCH_REMINDER_TIMINGS),
      analysis: progressAnalysis
    });
  } catch (error) {
    console.error('Error fetching research alerts:', error);
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch research alerts' },
      { status: 500 }
    );
  }
}

// POST /api/research-alerts - Process research alerts or parse deadlines
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { action, text, paperId, deadline } = body;
    
    switch (action) {
      case 'process_user':
        // Process research alerts for current user
        await processResearchAlerts(user.id);
        return NextResponse.json({ 
          success: true, 
          message: 'Research alerts processed for current user',
          processedUserId: user.id
        });
        
      case 'process_all':
        // Process research alerts for all users (admin feature)
        const results = await processAllResearchAlerts();
        return NextResponse.json({
          success: true,
          message: 'Research alerts processed for all users',
          results
        });
        
      case 'parse_deadline':
        // Parse deadline from natural language text
        if (!text) {
          return NextResponse.json(
            { error: 'Text is required for deadline parsing' },
            { status: 400 }
          );
        }
        
        const parsedDate = parseDeadlineFromText(text);
        return NextResponse.json({
          success: true,
          parsedDate,
          originalText: text,
          found: parsedDate !== null
        });
        
      case 'schedule_deadline_reminder':
        // Schedule a specific research deadline reminder
        if (!paperId || !deadline) {
          return NextResponse.json(
            { error: 'paperId and deadline object are required' },
            { status: 400 }
          );
        }
        
        await scheduleResearchDeadlineReminder(
          user.id,
          deadline.paperId,
          deadline.paperTitle,
          deadline
        );
        
        return NextResponse.json({
          success: true,
          message: 'Research deadline reminder scheduled',
          deadline
        });
        
      case 'analyze_progress':
        // Get detailed progress analysis
        const analysis = await analyzeResearchProgress(user.id);
        return NextResponse.json({
          success: true,
          analysis
        });
        
      case 'extract_deadlines':
        // Extract deadlines from a specific paper
        if (!paperId) {
          return NextResponse.json(
            { error: 'paperId is required' },
            { status: 400 }
          );
        }
        
        const papers = await getResearchPapersWithDeadlines(user.id);
        const paper = papers.find(p => p.id === paperId);
        
        if (!paper) {
          return NextResponse.json(
            { error: 'Paper not found' },
            { status: 404 }
          );
        }
        
        const extractedDeadlines = extractPotentialDeadlines(paper);
        return NextResponse.json({
          success: true,
          paper: {
            id: paper.id,
            title: paper.title
          },
          deadlines: extractedDeadlines
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use process_user, process_all, parse_deadline, schedule_deadline_reminder, analyze_progress, or extract_deadlines' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing research alerts:', error);
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to process research alerts' },
      { status: 500 }
    );
  }
} 