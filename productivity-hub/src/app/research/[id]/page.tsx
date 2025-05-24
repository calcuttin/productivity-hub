"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ResearchPaper, Author, Citation } from '@/types/research';
import Navigation from '@/components/Navigation';

export default function ResearchPaperDetailPage() {
  const router = useRouter();
  const params = useParams();
  const paperId = params.id as string;

  const [paper, setPaper] = useState<ResearchPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (paperId) {
      const fetchPaperDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/research/${paperId}`);
          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 404) {
              setError('Research paper not found.');
            } else {
              throw new Error(errorData.message || `Failed to fetch paper: ${response.statusText}`);
            }
            setPaper(null); // Ensure paper is null if not found or error
            return;
          }
          const data: ResearchPaper = await response.json();
          setPaper(data);
        } catch (err) {
          console.error(err);
          setError((err as Error).message);
          setPaper(null);
        } finally {
          setLoading(false);
        }
      };
      fetchPaperDetails();
    }
  }, [paperId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
        <Navigation />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <p className="text-center text-lg text-gray-700 dark:text-gray-300">Loading paper details...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
        <Navigation />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <p className="text-center text-red-600 dark:text-red-400">Error: {error}</p>
          <div className="text-center mt-4">
            <Link href="/research" className="text-blue-600 hover:underline dark:text-blue-400">
              Back to Research Papers List
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
        <Navigation />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <p className="text-center text-lg text-gray-700 dark:text-gray-300">Paper not found.</p>
          <div className="text-center mt-4">
            <Link href="/research" className="text-blue-600 hover:underline dark:text-blue-400">
              Back to Research Papers List
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Helper to format authors
  const formatAuthors = (authors: Author[] | undefined) => {
    if (!authors || authors.length === 0) return 'N/A';
    return authors.map(a => `${a.firstName} ${a.middleName || ''} ${a.lastName}${a.orcid ? ` (ORCID: ${a.orcid})` : ''}`).join('; ');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{paper.title}</h1>
            <p className="text-md text-gray-600 dark:text-gray-400 mt-1">
              {paper.publication ? `${paper.publication}, ` : ''}{paper.year || 'Year N/A'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-1">Authors</h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{formatAuthors(paper.authors)}</p>
              </div>
              {paper.abstract && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-1">Abstract</h2>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-justify">{paper.abstract}</p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {paper.keywords && paper.keywords.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Keywords</h2>
                  <div className="flex flex-wrap gap-2">
                    {paper.keywords.map(keyword => (
                      <span key={keyword} className="bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {paper.filePath && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-1">File/Link</h2>
                  <a 
                    href={paper.filePath} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline break-all"
                  >
                    {paper.filePath}
                  </a>
                </div>
              )}
              {paper.notes && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-1">Notes</h2>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">{paper.notes}</p>
                </div>
              )}
            </div>
          </div>

          {paper.citations && paper.citations.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Citations ({paper.citations.length})</h2>
              <div className="space-y-4">
                {paper.citations.map(citation => (
                  <div key={citation.id || citation.key} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">[{citation.key}] <span className="text-sm font-normal text-gray-600 dark:text-gray-400">({citation.type})</span></h3>
                    <div className="mt-1 pl-4 text-sm text-gray-700 dark:text-gray-300">
                      {Object.entries(citation.fields).map(([fieldName, fieldValue]) => (
                        <p key={fieldName}><strong className="capitalize">{fieldName.replace(/_/g, ' ')}:</strong> {String(fieldValue)}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <Link href="/research" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150">
              &larr; Back to All Research Papers
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
} 