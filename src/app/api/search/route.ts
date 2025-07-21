import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { globalSearch, getSearchSuggestions, type SearchFilters } from '@/lib/search';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const action = searchParams.get('action');

    // Handle suggestions endpoint
    if (action === 'suggestions') {
      if (query.length < 2) {
        return NextResponse.json({ suggestions: [] });
      }

      const suggestions = await getSearchSuggestions(session.user.id!, query);
      return NextResponse.json({ suggestions });
    }

    // Handle main search
    if (!query.trim()) {
      return NextResponse.json({
        results: [],
        totalCount: 0,
        facets: { types: {}, statuses: {}, priorities: {} },
        query: '',
        filters: {},
        executionTime: 0
      });
    }

    // Parse filters from query parameters
    const filters: SearchFilters = {};

    // Content types filter
    const types = searchParams.get('types');
    if (types) {
      filters.types = types.split(',').filter(type => 
        ['project', 'todo', 'research', 'workout'].includes(type)
      ) as ('project' | 'todo' | 'research' | 'workout')[];
    }

    // Status filter
    const status = searchParams.get('status');
    if (status) {
      filters.status = status.split(',');
    }

    // Priority filter
    const priority = searchParams.get('priority');
    if (priority) {
      filters.priority = priority.split(',');
    }

    // Date range filter
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    if (dateFrom || dateTo) {
      filters.dateRange = {};
      if (dateFrom) filters.dateRange.from = new Date(dateFrom);
      if (dateTo) filters.dateRange.to = new Date(dateTo);
    }

    // Due date range filter
    const dueDateFrom = searchParams.get('dueDateFrom');
    const dueDateTo = searchParams.get('dueDateTo');
    if (dueDateFrom || dueDateTo) {
      filters.dueDateRange = {};
      if (dueDateFrom) filters.dueDateRange.from = new Date(dueDateFrom);
      if (dueDateTo) filters.dueDateRange.to = new Date(dueDateTo);
    }

    // Tags filter
    const tags = searchParams.get('tags');
    if (tags) {
      filters.tags = tags.split(',');
    }

    // Sorting
    const sortBy = searchParams.get('sortBy');
    if (sortBy && ['relevance', 'date', 'title', 'priority', 'dueDate'].includes(sortBy)) {
      filters.sortBy = sortBy as any;
    }

    const sortOrder = searchParams.get('sortOrder');
    if (sortOrder && ['asc', 'desc'].includes(sortOrder)) {
      filters.sortOrder = sortOrder as 'asc' | 'desc';
    }

    // Pagination
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    filters.limit = Math.min(limit, 100); // Max 100 results per page
    filters.offset = Math.max(offset, 0);

    // Perform search
    const searchResults = await globalSearch(session.user.id!, query, filters);

    return NextResponse.json(searchResults);

  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { query, filters } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Perform search with POST body filters
    const searchResults = await globalSearch(session.user.id!, query, filters || {});

    return NextResponse.json(searchResults);

  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
} 