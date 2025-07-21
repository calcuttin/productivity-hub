import { prisma } from './prisma';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  content?: string;
  type: 'project' | 'todo' | 'research' | 'workout';
  status?: string;
  priority?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  url: string;
  matchReason?: string;
  relevanceScore?: number;
}

export interface SearchFilters {
  types?: ('project' | 'todo' | 'research' | 'workout')[];
  status?: string[];
  priority?: string[];
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  dueDateRange?: {
    from?: Date;
    to?: Date;
  };
  tags?: string[];
  sortBy?: 'relevance' | 'date' | 'title' | 'priority' | 'dueDate';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  facets: {
    types: Record<string, number>;
    statuses: Record<string, number>;
    priorities: Record<string, number>;
  };
  query: string;
  filters: SearchFilters;
  executionTime: number;
}

/**
 * Perform global search across all content types
 */
export async function globalSearch(
  userId: string,
  query: string,
  filters: SearchFilters = {}
): Promise<SearchResponse> {
  const startTime = Date.now();
  
  try {
    const results: SearchResult[] = [];
    const facets = {
      types: {} as Record<string, number>,
      statuses: {} as Record<string, number>,
      priorities: {} as Record<string, number>
    };

    // Default filters
    const searchTypes = filters.types || ['project', 'todo', 'research', 'workout'];
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    // Search projects if included
    if (searchTypes.includes('project')) {
      const projectResults = await searchProjects(userId, query, filters);
      results.push(...projectResults);
      facets.types.project = projectResults.length;
    }

    // Search todos if included
    if (searchTypes.includes('todo')) {
      const todoResults = await searchTodos(userId, query, filters);
      results.push(...todoResults);
      facets.types.todo = todoResults.length;
    }

    // Search research papers if included
    if (searchTypes.includes('research')) {
      const researchResults = await searchResearch(userId, query, filters);
      results.push(...researchResults);
      facets.types.research = researchResults.length;
    }

    // Search workouts if included
    if (searchTypes.includes('workout')) {
      const workoutResults = await searchWorkouts(userId, query, filters);
      results.push(...workoutResults);
      facets.types.workout = workoutResults.length;
    }

    // Calculate relevance scores and sort
    const scoredResults = calculateRelevanceScores(results, query);
    const sortedResults = sortResults(scoredResults, filters.sortBy || 'relevance', filters.sortOrder || 'desc');

    // Apply pagination
    const paginatedResults = sortedResults.slice(offset, offset + limit);

    // Calculate facets for all results (not just paginated)
    calculateFacets(sortedResults, facets);

    const executionTime = Date.now() - startTime;

    return {
      results: paginatedResults,
      totalCount: sortedResults.length,
      facets,
      query,
      filters,
      executionTime
    };

  } catch (error) {
    console.error('Error performing global search:', error);
    throw error;
  }
}

/**
 * Search projects
 */
async function searchProjects(
  userId: string,
  query: string,
  filters: SearchFilters
): Promise<SearchResult[]> {
  try {
    const whereClause: any = {
      userId,
             OR: [
         { name: { contains: query, mode: 'insensitive' } },
         { description: { contains: query, mode: 'insensitive' } },
         { tags: { hasSome: [query] } }
       ]
    };

    // Apply filters
    if (filters.status?.length) {
      whereClause.status = { in: filters.status };
    }

    if (filters.priority?.length) {
      whereClause.priority = { in: filters.priority };
    }

    if (filters.dateRange) {
      whereClause.createdAt = {};
      if (filters.dateRange.from) {
        whereClause.createdAt.gte = filters.dateRange.from;
      }
      if (filters.dateRange.to) {
        whereClause.createdAt.lte = filters.dateRange.to;
      }
    }

    if (filters.dueDateRange) {
      whereClause.dueDate = {};
      if (filters.dueDateRange.from) {
        whereClause.dueDate.gte = filters.dueDateRange.from;
      }
      if (filters.dueDateRange.to) {
        whereClause.dueDate.lte = filters.dueDateRange.to;
      }
    }

         const projects = await prisma.project.findMany({
       where: whereClause,
       select: {
         id: true,
         name: true,
         description: true,
         status: true,
         priority: true,
         dueDate: true,
         tags: true,
         createdAt: true,
         updatedAt: true
       }
     });

     return projects.map(project => ({
       id: project.id,
       title: project.name,
       description: project.description || undefined,
      type: 'project' as const,
      status: project.status,
      priority: project.priority,
      dueDate: project.dueDate || undefined,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      url: `/projects`,
             matchReason: getMatchReason(query, project.name, project.description)
    }));

  } catch (error) {
    console.error('Error searching projects:', error);
    return [];
  }
}

/**
 * Search todos
 */
async function searchTodos(
  userId: string,
  query: string,
  filters: SearchFilters
): Promise<SearchResult[]> {
  try {
    const whereClause: any = {
      userId,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } }
      ]
    };

    // Apply filters
    if (filters.status?.length) {
      whereClause.status = { in: filters.status };
    }

    if (filters.priority?.length) {
      whereClause.priority = { in: filters.priority };
    }

    if (filters.dateRange) {
      whereClause.createdAt = {};
      if (filters.dateRange.from) {
        whereClause.createdAt.gte = filters.dateRange.from;
      }
      if (filters.dateRange.to) {
        whereClause.createdAt.lte = filters.dateRange.to;
      }
    }

    if (filters.dueDateRange) {
      whereClause.dueDate = {};
      if (filters.dueDateRange.from) {
        whereClause.dueDate.gte = filters.dueDateRange.from;
      }
      if (filters.dueDateRange.to) {
        whereClause.dueDate.lte = filters.dueDateRange.to;
      }
    }

    const todos = await prisma.todo.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        dueDate: true,
        completed: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return todos.map(todo => ({
      id: todo.id,
      title: todo.title,
      description: todo.description || undefined,
      type: 'todo' as const,
      status: todo.completed ? 'Completed' : 'Not Started',
      priority: todo.priority,
      dueDate: todo.dueDate || undefined,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
      url: `/todos`,
      matchReason: getMatchReason(query, todo.title, todo.description)
    }));

  } catch (error) {
    console.error('Error searching todos:', error);
    return [];
  }
}

/**
 * Search research papers
 */
async function searchResearch(
  userId: string,
  query: string,
  filters: SearchFilters
): Promise<SearchResult[]> {
  try {
    const whereClause: any = {
      userId,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { authors: { contains: query, mode: 'insensitive' } },
        { abstract: { contains: query, mode: 'insensitive' } },
        { notes: { contains: query, mode: 'insensitive' } },
        { journal: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: [query] } }
      ]
    };

    if (filters.dateRange) {
      whereClause.createdAt = {};
      if (filters.dateRange.from) {
        whereClause.createdAt.gte = filters.dateRange.from;
      }
      if (filters.dateRange.to) {
        whereClause.createdAt.lte = filters.dateRange.to;
      }
    }

    const papers = await prisma.researchPaper.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        abstract: true,
        notes: true,
        publication: true,
        year: true,
        keywords: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return papers.map(paper => ({
      id: paper.id,
      title: paper.title,
      description: paper.abstract || `Published in ${paper.publication || 'Unknown'}`,
      content: paper.notes || undefined,
      type: 'research' as const,
      createdAt: paper.createdAt,
      updatedAt: paper.updatedAt,
      url: `/research/${paper.id}`,
      matchReason: getMatchReason(query, paper.title, paper.abstract, paper.notes)
    }));

  } catch (error) {
    console.error('Error searching research papers:', error);
    return [];
  }
}

/**
 * Search workouts
 */
async function searchWorkouts(
  userId: string,
  query: string,
  filters: SearchFilters
): Promise<SearchResult[]> {
  try {
    const whereClause: any = {
      userId,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { type: { contains: query, mode: 'insensitive' } },
        { notes: { contains: query, mode: 'insensitive' } }
      ]
    };

    if (filters.dateRange) {
      whereClause.createdAt = {};
      if (filters.dateRange.from) {
        whereClause.createdAt.gte = filters.dateRange.from;
      }
      if (filters.dateRange.to) {
        whereClause.createdAt.lte = filters.dateRange.to;
      }
    }

    const workouts = await prisma.workout.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        notes: true,
        date: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return workouts.map(workout => ({
      id: workout.id,
      title: workout.name,
      description: undefined,
      content: workout.notes || undefined,
      type: 'workout' as const,
      dueDate: workout.date || undefined,
      createdAt: workout.createdAt,
      updatedAt: workout.updatedAt,
      url: `/workout`,
      matchReason: getMatchReason(query, workout.name, workout.notes)
    }));

  } catch (error) {
    console.error('Error searching workouts:', error);
    return [];
  }
}

/**
 * Calculate relevance scores for search results
 */
function calculateRelevanceScores(results: SearchResult[], query: string): SearchResult[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 0);

  return results.map(result => {
    let score = 0;
    const titleLower = result.title.toLowerCase();
    const descriptionLower = (result.description || '').toLowerCase();
    const contentLower = (result.content || '').toLowerCase();

    // Exact title match gets highest score
    if (titleLower === queryLower) {
      score += 100;
    } else if (titleLower.includes(queryLower)) {
      score += 80;
    }

    // Title word matches with fuzzy matching
    queryWords.forEach(word => {
      if (titleLower.includes(word)) {
        score += 50;
      } else if (word.length > 2) {
        // Fuzzy matching for longer words
        const titleWords = titleLower.split(/\s+/);
        titleWords.forEach(titleWord => {
          if (titleWord.includes(word) || word.includes(titleWord)) {
            score += 30;
          }
        });
      }
      
      if (descriptionLower.includes(word)) {
        score += 20;
      }
      if (contentLower.includes(word)) {
        score += 10;
      }
    });

    // Boost recent items
    const daysSinceUpdate = (Date.now() - new Date(result.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 7) {
      score += 10;
    } else if (daysSinceUpdate < 30) {
      score += 5;
    }

    // Boost by priority
    if (result.priority === 'High') {
      score += 15;
    } else if (result.priority === 'Medium') {
      score += 10;
    }

    // Boost items with due dates
    if (result.dueDate) {
      const daysUntilDue = (new Date(result.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysUntilDue > 0 && daysUntilDue < 7) {
        score += 20; // Due soon
      } else if (daysUntilDue < 0 && daysUntilDue > -1) {
        score += 25; // Due today
      } else if (daysUntilDue < 0) {
        score += 30; // Overdue
      }
    }

    // Boost by type (prioritize projects and todos)
    if (result.type === 'project') {
      score += 5;
    } else if (result.type === 'todo') {
      score += 3;
    }

    // Boost items with more content
    const contentLength = (result.description?.length || 0) + (result.content?.length || 0);
    if (contentLength > 100) {
      score += 5;
    }

    return {
      ...result,
      relevanceScore: Math.max(score, 1) // Minimum score of 1
    };
  });
}

/**
 * Sort search results
 */
function sortResults(
  results: SearchResult[],
  sortBy: string,
  sortOrder: 'asc' | 'desc'
): SearchResult[] {
  return results.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'relevance':
        comparison = (b.relevanceScore || 0) - (a.relevanceScore || 0);
        break;
      case 'date':
        comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        comparison = (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                    (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
        break;
      case 'dueDate':
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        comparison = aDate - bDate;
        break;
      default:
        comparison = (b.relevanceScore || 0) - (a.relevanceScore || 0);
    }

    return sortOrder === 'desc' ? comparison : -comparison;
  });
}

/**
 * Calculate facets for filtering
 */
function calculateFacets(results: SearchResult[], facets: any) {
  results.forEach(result => {
    // Count statuses
    if (result.status) {
      facets.statuses[result.status] = (facets.statuses[result.status] || 0) + 1;
    }

    // Count priorities
    if (result.priority) {
      facets.priorities[result.priority] = (facets.priorities[result.priority] || 0) + 1;
    }
  });
}

/**
 * Determine why a result matched the search query
 */
function getMatchReason(query: string, ...fields: (string | undefined | null)[]): string {
  const queryLower = query.toLowerCase();
  
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (field && field.toLowerCase().includes(queryLower)) {
      switch (i) {
        case 0: return 'Title match';
        case 1: return 'Description match';
        case 2: return 'Content match';
        case 3: return 'Author match';
        default: return 'Content match';
      }
    }
  }
  
  return 'Keyword match';
}

/**
 * Get search suggestions based on query
 */
export async function getSearchSuggestions(
  userId: string,
  query: string,
  limit: number = 5
): Promise<string[]> {
  if (query.length < 2) return [];

  try {
    const suggestions = new Set<string>();

    // Get project titles
    const projects = await prisma.project.findMany({
      where: {
        userId,
        name: { contains: query, mode: 'insensitive' }
      },
      select: { name: true },
      take: limit
    });

    projects.forEach(p => suggestions.add(p.name));

    // Get todo titles
    const todos = await prisma.todo.findMany({
      where: {
        userId,
        title: { contains: query, mode: 'insensitive' }
      },
      select: { title: true },
      take: limit
    });

    todos.forEach(t => suggestions.add(t.title));

    // Get research paper titles
    const papers = await prisma.researchPaper.findMany({
      where: {
        userId,
        title: { contains: query, mode: 'insensitive' }
      },
      select: { title: true },
      take: limit
    });

    papers.forEach(p => suggestions.add(p.title));

    return Array.from(suggestions).slice(0, limit);

  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return [];
  }
} 