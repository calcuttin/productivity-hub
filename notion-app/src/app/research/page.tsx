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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
        <Navigation />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <p className="text-center text-gray-700 dark:text-gray-300">Loading research papers...</p>
        </main>
      </div>
    );
  }
  
  // UI Rendering (largely unchanged, but now uses API-driven state)
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Research Papers</h1>
          <button
            onClick={() => { setShowForm(true); setEditingPaperId(null); setForm(initialPaperFormState); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150"
          >
            Add New Paper
          </button>
        </div>

        {error && (
          <div className="my-4 p-3 bg-red-100 dark:bg-red-800/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}

        {/* Form Modal/Section */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
                {editingPaperId ? 'Edit Research Paper' : 'Add New Research Paper'}
              </h2>
              <form onSubmit={(e) => { e.preventDefault(); handleSavePaper(); }} className="space-y-4">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title*</label>
                  <input type="text" name="title" id="title" value={form.title} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>

                {/* Authors Section */}
                <div className="my-4 pt-4 border-t dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Authors</h3>
                    {form.authors.map((author, index) => (
                        <div key={author.id || index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-2 rounded mb-2 text-sm">
                            <span className="text-gray-700 dark:text-gray-300">{author.firstName} {author.middleName} {author.lastName} {author.orcid && `(ORCID: ${author.orcid})`}</span>
                            <button type="button" onClick={() => handleRemoveAuthor(index)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-xs">Remove</button>
                        </div>
                    ))}
                    <div className="space-y-2 md:space-y-0 md:flex md:space-x-2 items-end">
                        <div className='flex-1'><label className="text-xs text-gray-500 dark:text-gray-400">First Name*</label><input type="text" name="firstName" placeholder="First Name" value={authorInput.firstName} onChange={handleAuthorInputChange} className="w-full px-2 py-1.5 border dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" /></div>
                        <div className='flex-1'><label className="text-xs text-gray-500 dark:text-gray-400">Middle Name</label><input type="text" name="middleName" placeholder="Middle Name" value={authorInput.middleName || ''} onChange={handleAuthorInputChange} className="w-full px-2 py-1.5 border dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" /></div>
                        <div className='flex-1'><label className="text-xs text-gray-500 dark:text-gray-400">Last Name*</label><input type="text" name="lastName" placeholder="Last Name" value={authorInput.lastName} onChange={handleAuthorInputChange} className="w-full px-2 py-1.5 border dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" /></div>
                        <div className='flex-1'><label className="text-xs text-gray-500 dark:text-gray-400">ORCID</label><input type="text" name="orcid" placeholder="ORCID" value={authorInput.orcid || ''} onChange={handleAuthorInputChange} className="w-full px-2 py-1.5 border dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" /></div>
                        <button type="button" onClick={handleAddAuthor} className="px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 text-sm">Add Author</button>
                    </div>
                </div>
                
                {/* Publication & Year */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="publication" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Publication</label>
                        <input type="text" name="publication" id="publication" value={form.publication || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                    </div>
                    <div>
                        <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
                        <input type="number" name="year" id="year" value={form.year || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                    </div>
                </div>
                {/* Abstract, Keywords, File Path, Notes - similar input structure */}
                <div>
                  <label htmlFor="abstract" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Abstract</label>
                  <textarea name="abstract" id="abstract" value={form.abstract || ''} onChange={handleInputChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>

                {/* Keywords Section */}
                <div className="my-4 pt-4 border-t dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Keywords</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {(form.keywords || []).map((keyword, index) => (
                            <span key={index} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full text-sm flex items-center">
                                {keyword}
                                <button type="button" onClick={() => removeKeyword(keyword)} className="ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 text-xs">&#x2715;</button>
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="text" value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} placeholder="Add keyword" className="flex-grow px-3 py-1.5 border dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                        <button type="button" onClick={addKeyword} className="px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 text-sm">Add Keyword</button>
                    </div>
                </div>

                <div>
                  <label htmlFor="filePath" className="block text-sm font-medium text-gray-700 dark:text-gray-300">File Path (e.g., URL to PDF)</label>
                  <input type="text" name="filePath" id="filePath" value={form.filePath || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                  <textarea name="notes" id="notes" value={form.notes || ''} onChange={handleInputChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>

                {/* Citations Section */}
                <div className="my-4 pt-4 border-t dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Citations</h3>
                    <div>
                      <label htmlFor="bibtex-import" className="mr-2 px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm cursor-pointer">
                        Import BibTeX
                      </label>
                      <input id="bibtex-import" type="file" accept=".bib" onChange={handleBibTeXImport} className="hidden" />
                      <button type="button" onClick={handleBibTeXExport} className="px-3 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 text-sm">
                        Export Citations
                      </button>
                    </div>
                  </div>

                  {!showCitationForm && (
                    <button type="button" onClick={openNewCitationForm} className="mb-2 px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm">
                      Add New Citation Manually
                    </button>
                  )}

                  {showCitationForm && (
                    <div className="p-4 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 space-y-3">
                      <h4 className="text-md font-semibold mb-2 text-gray-700 dark:text-gray-300">{editingCitationIndex !== null ? 'Edit Citation' : 'Add New Citation'}</h4>
                      <input name="key" value={currentCitation.key} onChange={handleCitationChange} required placeholder="Citation Key (e.g., AuthorYear)" className="w-full px-2 py-1.5 border dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100" />
                      <select name="type" value={currentCitation.type} onChange={handleCitationChange} className="w-full px-2 py-1.5 border dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100">
                        <option value="article">Article</option>
                        <option value="book">Book</option>
                        <option value="inproceedings">In Proceedings</option>
                        <option value="phdthesis">PhD Thesis</option>
                        <option value="misc">Misc</option>
                        {/* Add more types as needed */}
                      </select>
                      
                      <div className="pt-2 border-t dark:border-gray-500">
                        <h5 className="text-sm font-semibold mb-1 text-gray-600 dark:text-gray-400">Fields:</h5>
                        {Object.entries(currentCitation.fields).map(([name, value]) => (
                          <div key={name} className="flex items-center justify-between bg-gray-100 dark:bg-gray-600/70 p-1.5 rounded mb-1 text-xs">
                            <span className="text-gray-700 dark:text-gray-300"><strong>{name}:</strong> {String(value)}</span>
                            <button type="button" onClick={() => handleRemoveCitationField(name)} className="text-red-500 hover:text-red-600 text-xs">Remove</button>
                          </div>
                        ))}
                        <div className="flex items-center space-x-1 mt-2">
                          <input type="text" name="name" value={citationFieldInput.name} onChange={handleCitationFieldChange} placeholder="Field Name (e.g., author)" className="flex-grow px-2 py-1 border dark:border-gray-500 rounded-md text-xs bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100" />
                          <input type="text" name="value" value={citationFieldInput.value} onChange={handleCitationFieldChange} placeholder="Field Value" className="flex-grow px-2 py-1 border dark:border-gray-500 rounded-md text-xs bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100" />
                          <button type="button" onClick={handleAddOrUpdateCitationField} className="px-2 py-1 bg-sky-500 text-white rounded hover:bg-sky-600 text-xs">Add Field</button>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 pt-3">
                        <button type="button" onClick={() => { setShowCitationForm(false); setCurrentCitation(initialCitationFormState); setEditingCitationIndex(null); }} className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded">Cancel</button>
                        <button type="button" onClick={handleSaveCitation} className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600">Save Citation</button>
                      </div>
                    </div>
                  )}

                  {form.citations.length > 0 && !showCitationForm && (
                    <div className="mt-3 space-y-2">
                      {form.citations.map((citation, index) => (
                        <div key={citation.id || index} className="bg-gray-50 dark:bg-gray-700/60 p-3 rounded-md text-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <strong className="text-gray-800 dark:text-gray-100">[{citation.key}] ({citation.type})</strong>
                              <div className="ml-2 text-xs text-gray-600 dark:text-gray-300">
                                {Object.entries(citation.fields).map(([fieldName, fieldValue]) => (
                                  <div key={fieldName}><em>{fieldName}:</em> {String(fieldValue)}</div>
                                ))}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button type="button" onClick={() => editCitation(index)} className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 text-xs">Edit</button>
                              <button type="button" onClick={() => deleteCitation(index)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-xs">Remove</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>


                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
                  <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition duration-150">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition duration-150" disabled={isLoading}>
                    {isLoading ? (editingPaperId ? 'Updating...' : 'Saving...') : (editingPaperId ? 'Update Paper' : 'Save Paper')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Papers List */}
        { !showForm && papers.length === 0 && !isLoading && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No research papers added yet. Click &quot;Add New Paper&quot; to get started.
            </p>
        )}
        {!showForm && papers.length > 0 && (
          <div className="space-y-4">
            {papers.map(paper => (
              <div key={paper.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-150">
                <div className="flex justify-between items-start">
                  <div>
                    <Link href={`/research/${paper.id}`} className="hover:underline">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1 inline hover:text-blue-600 dark:hover:text-blue-400">{paper.title}</h2>
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {paper.authors && paper.authors.map(a => `${a.firstName} ${a.lastName}`).join(', ')}
                      {paper.publication && ` - ${paper.publication}`} ({paper.year})
                    </p>
                     {paper.filePath && (
                        <a href={paper.filePath} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 mt-1 inline-block">
                            View PDF/Source
                        </a>
                    )}
                  </div>
                  <div className="flex space-x-2 flex-shrink-0 ml-4">
                    <button onClick={() => handleEditPaper(paper)} className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600">Edit</button>
                    <button onClick={() => handleDeletePaper(paper.id)} className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600" disabled={isLoading}>
                      {isLoading ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 