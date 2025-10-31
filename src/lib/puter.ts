import { create } from "zustand";

// --- START: MINIMAL MOCK TYPES FOR COMPILATION ---
// Questi tipi sono definiti per permettere a TypeScript di compilare il codice.
// Nel tuo progetto reale, dovresti importare questi tipi dall'SDK di Puter.

interface PuterUser {
  id: string;
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
  system_prompt?: string;
  max_tokens?: number;
}

interface AIResponse {
  message: {
    content: string | ChatContent[];
    role: "assistant"
  }
}

interface KVItem {
  key: string;
  value: string;
}
// --- END: MINIMAL MOCK TYPES FOR COMPILATION ---


// Define the global window.puter object for TypeScript
declare global {
  interface Window {
    puter: {
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
        // La firma di 'chat' nell'interfaccia globale è più generica, ma il tuo store la tipa come Promise<object>
        chat: (
          prompt: string | ChatMessage[],
          imageURL?: string | PuterChatOptions,
          testMode?: boolean,
          options?: PuterChatOptions
        ) => Promise<object>;
        img2txt: (image: string | File | Blob, testMode?: boolean) => Promise<string>;
      };
      kv: {
        get: (key: string) => Promise<string | null>;
        set: (key: string, value: string) => Promise<boolean>;
        delete: (key: string) => Promise<boolean>;
        list: (pattern: string, returnValues?: boolean) => Promise<string[] | KVItem[]>;
        flush: () => Promise<boolean>;
      };
    };
  }
}

// Define the structure of the Puter store
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
    // Ho tipato le funzioni di AI per restituire un tipo coerente o 'undefined' in caso di errore
    chat: (
      prompt: string | ChatMessage[],
      imageURL?: string | PuterChatOptions,
      testMode?: boolean,
      options?: PuterChatOptions
    ) => Promise<AIResponse | undefined>;
    // Ho rimosso AIResponse nel tipo di ritorno, poiché la funzione chat globale torna object.
    // L'implementazione di feedback qui utilizza chat.
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

/**
 * A reusable helper function to safely access the Puter SDK.
 * @returns {object | null} The Puter SDK object or null if not available.
 */
const getPuter = (): typeof window.puter | null =>
  typeof window !== "undefined" && window.puter ? window.puter : null;


export const usePuterStore = create<PuterStore>((set, get) => {
  /**
    * Sets an error message in the store.
    * @param {string} msg The error message.
    */
  const setError = (msg: string) => {
    set({
      error: msg,
      isLoading: false,
      auth: {
        ...get().auth,
        user: null,
        isAuthenticated: false,
      },
    });
  };

  /**
    * A helper function to create safe Puter actions that check for Puter's availability.
    * @param action A function that interacts with the Puter SDK.
    * @returns An async function that wraps the Puter action.
    */
  const createPuterAction = <T extends (puter: typeof window.puter, ...args: any[]) => any>(action: T) => async (
    ...args: Parameters<T> extends [typeof window.puter, ...infer R] ? R : Parameters<T>
  ): Promise<Awaited<ReturnType<T>> | undefined> => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    try {
      // @ts-ignore: L'interferenza dei parametri di TypeScript è complessa qui, ma la logica è corretta.
      return await action(puter, ...args);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An unknown error occurred";
      setError(msg);
      // Restituisce undefined in caso di errore per coerenza con il tipo di ritorno della Promise
      return undefined;
    }
  };

  /**
    * Checks the authentication status of the user.
    * @returns {Promise<boolean>} True if the user is signed in, false otherwise.
    */
  const checkAuthStatus = async (): Promise<boolean> => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      const isSignedIn = await puter.auth.isSignedIn();
      if (isSignedIn) {
        const user = await puter.auth.getUser();
        set({
          auth: { ...get().auth, user, isAuthenticated: true },
          isLoading: false,
        });
        return true;
      } else {
        set({
          auth: { ...get().auth, user: null, isAuthenticated: false },
          isLoading: false,
        });
        return false;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to check auth status";
      setError(msg);
      return false;
    }
  };

  /**
    * Initiates the sign-in process.
    */
  const signIn = async (): Promise<void> => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      await puter.auth.signIn();
      await checkAuthStatus();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      setError(msg);
    }
  };

  /**
    * Signs the user out.
    */
  const signOut = async (): Promise<void> => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      await puter.auth.signOut();
      set({
        auth: { ...get().auth, user: null, isAuthenticated: false },
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign out failed";
      setError(msg);
    }
  };

  /**
    * Refreshes the current user's data.
    */
  const refreshUser = createPuterAction(async (puter) => {
    const user = await puter.auth.getUser();
    set({
      auth: { ...get().auth, user, isAuthenticated: true },
      isLoading: false,
    });
    // Rimuovi il return di refreshUser poiché la funzione è definita come Promise<void> nell'interfaccia PuterStore
  });

  /**
    * Initializes the Puter store and checks for the Puter SDK.
    */
  const init = (): void => {
    // Evita di eseguire init multipli se puter è già pronto
    if (get().puterReady) return;

    if (getPuter()) {
      set({ puterReady: true });
      checkAuthStatus();
      return;
    }

    const interval = setInterval(() => {
      if (getPuter()) {
        clearInterval(interval);
        set({ puterReady: true });
        checkAuthStatus();
      }
    }, 100);

    setTimeout(() => {
      // Controlla se l'intervallo è ancora attivo prima di provare a cancellarlo
      if (!get().puterReady) {
        clearInterval(interval);
        setError("Puter.js failed to load within 10 seconds");
      }
    }, 10000);
  };

  // Create safe actions for fs, ai, and kv using the helper
  const fsActions = {
    write: createPuterAction((puter, path: string, data: string | File | Blob) => puter.fs.write(path, data)),
    // La funzione 'read' di puter.fs ritorna solo Promise<Blob>, 
    // ma la definizione dello store è Promise<Blob | undefined>
    read: createPuterAction((puter, path: string) => puter.fs.read(path)),
    readDir: createPuterAction((puter, path: string) => puter.fs.readdir(path)),
    upload: createPuterAction((puter, files: File[] | Blob[]) => puter.fs.upload(files)),
    delete: createPuterAction((puter, path: string) => puter.fs.delete(path)),
  };

  const aiActions = {
    chat: createPuterAction((puter, prompt, imageURL, testMode, options) =>
      puter.ai.chat(prompt, imageURL, testMode, options)
    ),
    // Correzione e semplificazione del tipo di ritorno di feedback
    feedback: createPuterAction((puter, path: string, message: string) =>
      puter.ai.chat(
        [
          {
            role: "user",
            content: [
              { type: "file", puter_path: path },
              { type: "text", text: message },
            ] as ChatContent[], // Cast esplicito a ChatContent[] per l'array
          },
        ],
        { model: "claude-sonnet-4" }
      ) as Promise<object> // Assicuriamo che il tipo di ritorno sia compatibile
    ),
    img2txt: createPuterAction((puter, image: string | File | Blob, testMode?: boolean) =>
      puter.ai.img2txt(image, testMode)
    ),
  };

  const kvActions = {
    get: createPuterAction((puter, key: string) => puter.kv.get(key)),
    set: createPuterAction((puter, key: string, value: string) => puter.kv.set(key, value)),
    delete: createPuterAction((puter, key: string) => puter.kv.delete(key)),
    list: createPuterAction((puter, pattern: string, returnValues?: boolean) =>
      puter.kv.list(pattern, returnValues)
    ),
    flush: createPuterAction((puter) => puter.kv.flush()),
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
  } as PuterStore;
});
