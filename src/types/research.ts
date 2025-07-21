export interface CitationField {
  [key: string]: string; // e.g., { author: "Knuth, Donald E.", title: "The Art of Computer Programming", year: "1968" }
}

export interface Citation {
  id: string;
  key: string; // Unique key for the citation, e.g., Knuth1968
  type: string; // e.g., article, book, inproceedings
  fields: CitationField;
}

export interface Author {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  orcid?: string; // Optional Open Researcher and Contributor ID
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: Author[]; // Updated from string[] to Author[]
  publication?: string; // Journal, conference, etc.
  year?: number;
  abstract?: string;
  keywords?: string[];
  filePath?: string; // Path to the PDF or link
  notes?: string;
  citations?: Citation[]; // Embedded or referenced citations
} 