// Character types
export interface CharacterData {
  name: string;
  description: string;
  personality: string;
  mes_example: string;
  scenario: string;
  first_mes: string;
  alternate_greetings: string[];
  creator: string;
  creator_notes: string;
  character_version: string;
  tags: string[];
  system_prompt: string;
  post_history_instructions: string;
  character_book_id?: string;
  extensions: Record<string, unknown>;
}

export interface CharacterDatabaseData extends CharacterData {
  id: string;
  image_path?: string;
  created_at: string;
  updated_at: string;
}

export interface CharacterWithImage extends CharacterDatabaseData {
  image?: string; // Base64 encoded image
}

// Character Book types
export interface CharacterBookEntry {
  id?: number;
  name?: string;
  comment?: string;
  enabled: boolean;
  case_sensitive?: boolean;
  selective?: boolean;
  constant?: boolean;
  position: 'before_char' | 'after_char';
  keys: string[];
  secondary_keys: string[];
  content: string;
  insertion_order: number;
  priority?: number;
  extensions: Record<string, unknown>;
}

export interface CharacterBookData {
  name: string;
  description?: string;
  scan_depth?: number;
  token_budget?: number;
  recursive_scanning?: boolean;
  extensions: Record<string, unknown>;
  entries: CharacterBookEntry[];
}

export interface CharacterBookDatabaseData extends CharacterBookData {
  id: string;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Database export types
export interface IndexedDBExport {
  characters: CharacterWithImage[];
  characterBooks: CharacterBookDatabaseData[];
}
