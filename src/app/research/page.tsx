"use client";
import Navigation from '@/components/Navigation';
import { useEffect, useState, Fragment } from 'react';
import { ResearchPaper, Author, Citation, CitationField } from '@/types/research';
import { v4 as uuidv4 } from 'uuid';
import { bibtexParse, toBibtex } from '@orcid/bibtex-parse-js';
import Link from 'next/link';

// Define a type for authors and citations within the form, which might not have an ID yet.
type FormAuthor = Omit<Author, 'id'> & { id?: string }; 
type FormCitation = Omit<Citation, 'id'> & { id?: string };

const initialPaperFormState: Omit<ResearchPaper, 'id' | 'createdAt' | 'updatedAt' | 'authors' | 'citations'> & { authors: FormAuthor[], citations: FormCitation[] } = {
  title: '',
  authors: [],
  publication: '',
  year: new Date().getFullYear(),
  abstract: '',
  keywords: [],
  filePath: '',
  notes: '',
  citations: [],
};

// State for individual author input fields
const initialAuthorInputState: Omit<Author, 'id'> = {
  firstName: '',
  lastName: '',
  middleName: '',
  orcid: '',
};

// State for individual citation input
const initialCitationFormState: Omit<Citation, 'id'> = {
  key: '',
  type: 'article', // Default type
  fields: {},
};

const initialCitationFieldInputState = { name: '', value: '' };

export default function ResearchPage() {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialPaperFormState);
  const [editingPaperId, setEditingPaperId] = useState<string | null>(null);
  
  // Updated author input state
  const [authorInput, setAuthorInput] = useState(initialAuthorInputState);
  const [keywordInput, setKeywordInput] = useState('');

  // Citation state
  const [currentCitation, setCurrentCitation] = useState<FormCitation>(initialCitationFormState);
  const [showCitationForm, setShowCitationForm] = useState(false);
  const [editingCitationIndex, setEditingCitationIndex] = useState<number | null>(null);
  const [citationFieldInput, setCitationFieldInput] = useState(initialCitationFieldInputState);

  // Fetch papers from API on component mount
  useEffect(() => {
    fetchPapers();
  }, []);

  async function fetchPapers() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/research');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch papers: ${response.statusText}`);
      }
      const data: ResearchPaper[] = await response.json();
      // Dates from Prisma might be ISO strings, ensure they are handled correctly if needed for display/input
      // For now, assuming they are compatible with our ResearchPaper type or don't need immediate transformation.
      setPapers(data);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "year" || name === "progress") {
      setForm(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Updated author input handling
  const handleAuthorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAuthorInput(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAuthor = () => {
    if (authorInput.firstName && authorInput.lastName) {
      const newAuthor: FormAuthor = { ...authorInput }; // ID will be undefined, which is fine for FormAuthor
      setForm(prev => ({ ...prev, authors: [...prev.authors, newAuthor] }));
      setAuthorInput(initialAuthorInputState);
    } else {
      alert("First name and last name are required for authors.");
    }
  };

  const handleRemoveAuthor = (index: number) => {
    setForm(prev => ({ ...prev, authors: prev.authors.filter((_, i) => i !== index) }));
  };

  function addKeyword() {
    if (keywordInput.trim() && !form.keywords?.includes(keywordInput.trim())) {
      setForm(prev => ({ ...prev, keywords: [...(prev.keywords || []), keywordInput.trim()] }));
    }
    setKeywordInput('');
  }

  function removeKeyword(keywordToRemove: string) {
    setForm(prev => ({ ...prev, keywords: prev.keywords?.filter(k => k !== keywordToRemove) }));
  }

  // --- Citation Functions ---
  const handleCitationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentCitation(prev => ({ ...prev, [name]: value }));
  };

  const handleCitationFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCitationFieldInput(prev => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdateCitationField = () => {
    if (citationFieldInput.name.trim() && citationFieldInput.value.trim()) {
      setCurrentCitation(prev => ({
        ...prev,
        fields: {
          ...prev.fields,
          [citationFieldInput.name.trim()]: citationFieldInput.value.trim(),
        }
      }));
      setCitationFieldInput(initialCitationFieldInputState);
    }
  };

  const handleRemoveCitationField = (fieldName: string) => {
    const { [fieldName]: _, ...remainingFields } = currentCitation.fields;
    setCurrentCitation(prev => ({ ...prev, fields: remainingFields }));
  };

  function openNewCitationForm() {
    setCurrentCitation(initialCitationFormState);
    setEditingCitationIndex(null);
    setShowCitationForm(true);
  }

  function handleSaveCitation() {
    if (!currentCitation.key) {
      alert("Citation key is required.");
      return;
    }
    if (editingCitationIndex !== null) {
      setForm(prev => ({
        ...prev,
        citations: prev.citations.map((c, i) => i === editingCitationIndex ? { ...currentCitation } : c)
      }));
    } else {
      setForm(prev => ({ ...prev, citations: [...prev.citations, { ...currentCitation }] }));
    }
    setShowCitationForm(false);
    setEditingCitationIndex(null);
  }

  function editCitation(index: number) {
    const citationToEdit = form.citations[index];
    // Ensure it's a new object to avoid direct state mutation if it was complex
    setCurrentCitation(JSON.parse(JSON.stringify(citationToEdit)));
    setEditingCitationIndex(index);
    setShowCitationForm(true);
  }

  function deleteCitation(index: number) {
    setForm(prev => ({
      ...prev,
      citations: prev.citations?.filter((_, i) => i !== index)
    }));
  }
  
  // --- BibTeX Import Function ---
  function handleBibTeXImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const parsedEntries = bibtexParse.toJSON(content);
        const importedCitations = parsedEntries.map((entry: any) => {
          const fields: CitationField = {};
          for (const fieldName in entry.entryTags) {
            fields[fieldName.toLowerCase()] = entry.entryTags[fieldName];
          }
          return {
            key: entry.citationKey,
            type: entry.entryType.toLowerCase(),
            fields: fields,
          };
        });
        setForm(prev => ({ ...prev, citations: [...prev.citations, ...importedCitations] }));
      } catch (bibError) {
        console.error("Error parsing BibTeX file:", bibError);
        alert("Failed to parse BibTeX file. Please check the file format and content.");
      }
    };
    reader.onerror = () => {
        alert("Error reading BibTeX file.");
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  }
  // --- End BibTeX Import Function ---

  // --- BibTeX Export Function ---
  function handleBibTeXExport() {
    if (!form.citations || form.citations.length === 0) {
      alert("No citations to export for the current paper form.");
      return;
    }
    try {
      const bibtexJson = form.citations.map(c => ({
        citationKey: c.key,
        entryType: c.type.toUpperCase(),
        entryTags: { ...c.fields }
      }));
      
      const bibtexString = toBibtex(bibtexJson, {CRLF:true, whitespace:2});
      const blob = new Blob([bibtexString], { type: 'application/x-bibtex;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${form.title || 'citations'}.bib`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (exportError) {
      console.error("Error exporting BibTeX:", exportError);
      alert("Failed to export citations as BibTeX.");
    }
  }
  // --- End BibTeX Export Function ---

  const handleSavePaper = async () => {
    if (!form.title) {
      alert("Title is required.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Prepare payload. Authors and citations might need IDs if they already exist.
    // Our current form state for authors/citations doesn't have IDs for *newly added* ones.
    // The backend's connectOrCreate will handle creating new authors if no ID is passed.
    // For updates, we need to ensure existing author/citation IDs from the fetched paper are preserved.
    // This part is tricky and depends on how the edit form is populated.
    // For now, let's assume the `form` state correctly holds the data for create/update.
    // A robust solution would involve differentiating between new and existing authors/citations.
    
    const payload = {
        ...form,
        // Ensure authors and citations are in the format expected by the API
        // The API expects author objects for connectOrCreate.
        // If authors in the form are just Omit<Author, 'id'>, that's fine for creation.
        // For updates, if an author was fetched with an ID, that ID should be present.
        authors: form.authors.map(a => ({ 
            id: (a as Author).id || undefined, // Keep existing ID if present
            firstName: a.firstName,
            lastName: a.lastName,
            middleName: a.middleName,
            orcid: a.orcid,
        })),
        // Citations are created new on paper creation/update in current backend logic
        citations: form.citations.map(c => ({
            key: c.key,
            type: c.type,
            fields: c.fields,
        })),
    };
    
    try {
      let response;
      let responseData;

      if (editingPaperId) {
        response = await fetch(`/api/research/${editingPaperId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to save paper: ${response.statusText}`);
      }
      
      responseData = await response.json();

      if (editingPaperId) {
        setPapers(prev => prev.map(p => p.id === editingPaperId ? responseData : p));
      } else {
        setPapers(prev => [responseData, ...prev]);
      }
      resetForm();
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPaper = (paper: ResearchPaper) => {
    setShowForm(true);
    // The paper object from the API (and thus from `papers` state) should have IDs for authors/citations
    // We need to ensure the form is populated correctly with these.
    // Deep copy to avoid mutating state, especially for nested arrays/objects.
    const formStateForEdit = JSON.parse(JSON.stringify(paper));
    
    // Prisma's year might be a number, ensure form.year is set correctly
    formStateForEdit.year = paper.year || new Date().getFullYear();
    // Ensure authors and citations are arrays, even if null/undefined from DB
    formStateForEdit.authors = paper.authors || [];
    formStateForEdit.citations = paper.citations || [];


    setForm(formStateForEdit);
    setEditingPaperId(paper.id);
  };

  const handleDeletePaper = async (id: string) => {
    if (!confirm("Are you sure you want to delete this research paper?")) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/research/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete paper: ${response.statusText}`);
      }
      setPapers(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialPaperFormState);
    setEditingPaperId(null);
    setShowForm(false);
    setAuthorInput(initialAuthorInputState);
    setKeywordInput('');
    setShowCitationForm(false);
    setCurrentCitation(initialCitationFormState);
    setEditingCitationIndex(null);
    setCitationFieldInput(initialCitationFieldInputState);
    setError(null);
  };

  if (isLoading && papers.length === 0) { // Show loading only on initial fetch or if papers are empty
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // UI Rendering (largely unchanged, but now uses API-driven state)
  return (
    <div className="page-container">
      <Navigation />

      {/* Header */}
      <div className="bg-card border-b border-card">
        <div className="content-container">
          <div className="py-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-primary">Research Papers</h1>
                <p className="mt-2 text-secondary">Organize and manage your research papers and citations</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Paper</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="content-container">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary">Total Papers</p>
                <p className="text-2xl font-bold text-primary">{papers.length}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary">Total Authors</p>
                <p className="text-2xl font-bold text-primary">{papers.reduce((acc, paper) => acc + (paper.authors?.length || 0), 0)}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary">Total Citations</p>
                <p className="text-2xl font-bold text-primary">{papers.reduce((acc, paper) => acc + (paper.citations?.length || 0), 0)}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary">Recent Papers</p>
                <p className="text-2xl font-bold text-primary">{papers.filter(p => (p.year || 0) >= new Date().getFullYear() - 1).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Papers List */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-primary">Research Papers</h3>
          </div>

          <div className="divide-y divide-card">
            {papers.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <svg className="mx-auto h-12 w-12 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-primary">
                  No research papers found
                </h3>
                <p className="mt-1 text-sm text-muted">
                  Get started by adding your first research paper.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary mt-4"
                >
                  Add Your First Paper
                </button>
              </div>
            ) : (
              papers.map((paper) => (
                <div key={paper.id} className="px-6 py-4 hover:bg-card-secondary">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-primary truncate">
                          {paper.title}
                        </h4>
                        <span className="px-2 py-0.5 text-xs rounded-full font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {paper.year}
                        </span>
                      </div>
                      
                      {paper.authors && paper.authors.length > 0 && (
                        <p className="mt-1 text-sm text-secondary">
                          {paper.authors.map(author => `${author.firstName} ${author.lastName}`).join(', ')}
                        </p>
                      )}
                      
                      {paper.publication && (
                        <p className="mt-1 text-sm text-secondary">
                          {paper.publication}
                        </p>
                      )}
                      
                      {paper.abstract && (
                        <p className="mt-2 text-sm text-secondary line-clamp-2">
                          {paper.abstract}
                        </p>
                      )}
                      
                      {paper.keywords && paper.keywords.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {paper.keywords.slice(0, 3).map((keyword, index) => (
                            <span key={index} className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-primary rounded">
                              {keyword}
                            </span>
                          ))}
                          {paper.keywords.length > 3 && (
                            <span className="px-2 py-0.5 text-xs text-muted">
                              +{paper.keywords.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button 
                        onClick={() => handleEditPaper(paper)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                        title="Edit paper"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeletePaper(paper.id)}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                        title="Delete paper"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 