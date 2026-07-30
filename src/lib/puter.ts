import { create } from "zustand";

interface PuterUser {
  uuid?: string;
  id?: string;
  username: string;
  email?: string;
}

interface FSItem {
  name: string;
  path: string;
  is_dir: boolean;
}

interface ChatContent {
  type: "text" | "file";
  text?: string;
  puter_path?: string;
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string | ChatContent[];
}

interface PuterChatOptions {
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

interface AIResponse {
  message: {
    content: string | ChatContent[];
    role: string;
  };
}

interface KVItem {
  key: string;
  value: string;
}

interface PuterSdk {
  auth: {
    getUser: () => Promise<PuterUser>;
    isSignedIn: () => Promise<boolean>;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
  };
  fs: {
    write: (path: string, data: string | File | Blob) => Promise<File | undefined>;
    read: (path: string) => Promise<Blob>;
    upload: (files: File[] | Blob[]) => Promise<FSItem>;
    delete: (path: string) => Promise<void>;
    readdir: (path: string) => Promise<FSItem[] | undefined>;
  };
  ai: {
    chat: {
      (prompt: string, options?: PuterChatOptions): Promise<AIResponse>;
      (messages: ChatMessage[], testMode?: boolean, options?: PuterChatOptions): Promise<AIResponse>;
    };
    img2txt: (image: string | File | Blob, testMode?: boolean) => Promise<string>;
  };
  kv: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<boolean>;
    delete: (key: string) => Promise<boolean>;
    list: (pattern: string, returnValues?: boolean) => Promise<string[] | KVItem[]>;
    flush: () => Promise<boolean>;
  };
}

declare global {
  interface Window {
    puter?: PuterSdk;
  }
}

interface PuterStore {
  isLoading: boolean;
  error: string | null;
  puterReady: boolean;
  auth: {
    user: PuterUser | null;
    isAuthenticated: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
    checkAuthStatus: () => Promise<boolean>;
    getUser: () => PuterUser | null;
  };
  fs: {
    write: (path: string, data: string | File | Blob) => Promise<File | undefined>;
    read: (path: string) => Promise<Blob | undefined>;
    upload: (files: File[] | Blob[]) => Promise<FSItem | undefined>;
    delete: (path: string) => Promise<void>;
    readDir: (path: string) => Promise<FSItem[] | undefined>;
  };
  ai: {
    feedback: (path: string, message: string) => Promise<AIResponse | undefined>;
    img2txt: (image: string | File | Blob, testMode?: boolean) => Promise<string | undefined>;
  };
  kv: {
    get: (key: string) => Promise<string | null | undefined>;
    set: (key: string, value: string) => Promise<boolean | undefined>;
    delete: (key: string) => Promise<boolean | undefined>;
    list: (pattern: string, returnValues?: boolean) => Promise<string[] | KVItem[] | undefined>;
    flush: () => Promise<boolean | undefined>;
  };
  init: () => void;
  clearError: () => void;
}

const getPuter = (): PuterSdk | null =>
  typeof window !== "undefined" && window.puter ? window.puter : null;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return fallback;
};

export const usePuterStore = create<PuterStore>((set, get) => {
  const setError = (message: string, resetAuth = false) => {
    set((state) => ({
      error: message,
      isLoading: false,
      auth: resetAuth
        ? { ...state.auth, user: null, isAuthenticated: false }
        : state.auth,
    }));
  };

  const requirePuter = () => {
    const puter = getPuter();
    if (!puter) setError("Puter.js is not available. Reload the page and try again.");
    return puter;
  };

  const checkAuthStatus = async (): Promise<boolean> => {
    const puter = requirePuter();
    if (!puter) return false;

    set({ isLoading: true, error: null });
    try {
      const isSignedIn = await puter.auth.isSignedIn();
      if (!isSignedIn) {
        set((state) => ({ auth: { ...state.auth, user: null, isAuthenticated: false }, isLoading: false }));
        return false;
      }

      const user = await puter.auth.getUser();
      set((state) => ({ auth: { ...state.auth, user, isAuthenticated: true }, isLoading: false }));
      return true;
    } catch (error) {
      setError(getErrorMessage(error, "Failed to check Puter authentication."), true);
      return false;
    }
  };

  const signIn = async () => {
    const puter = requirePuter();
    if (!puter) return;
    set({ isLoading: true, error: null });
    try {
      await puter.auth.signIn();
      await checkAuthStatus();
    } catch (error) {
      setError(getErrorMessage(error, "Puter sign in failed."));
    }
  };

  const signOut = async () => {
    const puter = requirePuter();
    if (!puter) return;
    set({ isLoading: true, error: null });
    try {
      await puter.auth.signOut();
      set((state) => ({ auth: { ...state.auth, user: null, isAuthenticated: false }, isLoading: false }));
    } catch (error) {
      setError(getErrorMessage(error, "Puter sign out failed."));
    }
  };

  const refreshUser = async () => {
    const puter = requirePuter();
    if (!puter) return;
    try {
      const user = await puter.auth.getUser();
      set((state) => ({ auth: { ...state.auth, user, isAuthenticated: true }, isLoading: false }));
    } catch (error) {
      setError(getErrorMessage(error, "Failed to refresh the Puter user."));
    }
  };

  const init = () => {
    if (get().puterReady) return;
    const ready = () => {
      set({ puterReady: true, error: null });
      void checkAuthStatus();
    };

    if (getPuter()) return ready();

    const interval = window.setInterval(() => {
      if (getPuter()) {
        window.clearInterval(interval);
        ready();
      }
    }, 100);

    window.setTimeout(() => {
      if (!get().puterReady) {
        window.clearInterval(interval);
        setError("Puter.js failed to load. Check your connection and reload the page.");
      }
    }, 10000);
  };

  const fsActions = {
    write: async (path: string, data: string | File | Blob) => {
      const puter = requirePuter();
      if (!puter) return undefined;
      try { return await puter.fs.write(path, data); } catch (error) { setError(getErrorMessage(error, "Puter file write failed.")); return undefined; }
    },
    read: async (path: string) => {
      const puter = requirePuter();
      if (!puter) return undefined;
      try { return await puter.fs.read(path); } catch (error) { setError(getErrorMessage(error, "Puter file read failed.")); return undefined; }
    },
    upload: async (files: File[] | Blob[]) => {
      const puter = requirePuter();
      if (!puter) return undefined;
      try { return await puter.fs.upload(files); } catch (error) { setError(getErrorMessage(error, "Puter upload failed.")); return undefined; }
    },
    delete: async (path: string) => {
      const puter = requirePuter();
      if (!puter) return;
      try { await puter.fs.delete(path); } catch (error) { setError(getErrorMessage(error, "Puter file deletion failed.")); }
    },
    readDir: async (path: string) => {
      const puter = requirePuter();
      if (!puter) return undefined;
      try { return await puter.fs.readdir(path); } catch (error) { setError(getErrorMessage(error, "Puter directory read failed.")); return undefined; }
    },
  };

  const aiActions = {
    feedback: async (path: string, message: string) => {
      const puter = requirePuter();
      if (!puter) return undefined;

      const messages: ChatMessage[] = [{
        role: "user",
        content: [
          { type: "file", puter_path: path },
          { type: "text", text: message },
        ],
      }];

      try {
        set({ error: null });
        return await puter.ai.chat(messages, false, {
          model: "claude-sonnet",
          temperature: 0.2,
        });
      } catch (error) {
        setError(getErrorMessage(error, "Puter AI could not analyze the resume."));
        return undefined;
      }
    },
    img2txt: async (image: string | File | Blob, testMode?: boolean) => {
      const puter = requirePuter();
      if (!puter) return undefined;
      try { return await puter.ai.img2txt(image, testMode); } catch (error) { setError(getErrorMessage(error, "Puter image recognition failed.")); return undefined; }
    },
  };

  const kvActions = {
    get: async (key: string) => {
      const puter = requirePuter();
      if (!puter) return undefined;
      try { return await puter.kv.get(key); } catch (error) { setError(getErrorMessage(error, "Puter storage read failed.")); return undefined; }
    },
    set: async (key: string, value: string) => {
      const puter = requirePuter();
      if (!puter) return undefined;
      try { return await puter.kv.set(key, value); } catch (error) { setError(getErrorMessage(error, "Puter storage write failed.")); return undefined; }
    },
    delete: async (key: string) => {
      const puter = requirePuter();
      if (!puter) return undefined;
      try { return await puter.kv.delete(key); } catch (error) { setError(getErrorMessage(error, "Puter storage deletion failed.")); return undefined; }
    },
    list: async (pattern: string, returnValues?: boolean) => {
      const puter = requirePuter();
      if (!puter) return undefined;
      try { return await puter.kv.list(pattern, returnValues); } catch (error) { setError(getErrorMessage(error, "Puter storage list failed.")); return undefined; }
    },
    flush: async () => {
      const puter = requirePuter();
      if (!puter) return undefined;
      try { return await puter.kv.flush(); } catch (error) { setError(getErrorMessage(error, "Puter storage reset failed.")); return undefined; }
    },
  };

  return {
    isLoading: true,
    error: null,
    puterReady: false,
    auth: {
      user: null,
      isAuthenticated: false,
      signIn,
      signOut,
      refreshUser,
      checkAuthStatus,
      getUser: () => get().auth.user,
    },
    fs: fsActions,
    ai: aiActions,
    kv: kvActions,
    init,
    clearError: () => set({ error: null }),
  };
});
