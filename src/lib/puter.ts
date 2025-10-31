import { create } from "zustand";

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
        list: (pattern: string, returnValues?: boolean) => Promise<string[]>;
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
    chat: (
      prompt: string | ChatMessage[],
      imageURL?: string | PuterChatOptions,
      testMode?: boolean,
      options?: PuterChatOptions
    ) => Promise<AIResponse | undefined>;
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
 * @param {<T extends (...args: any[]) => any>(action: T) => (...args: Parameters<T>) => Promise<ReturnType<T> | undefined>} createPuterAction
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
  const createPuterAction = <T extends (...args: any[]) => any>(action: T) => async (
    ...args: Parameters<T>
  ): Promise<ReturnType<T> | undefined> => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    try {
      return await action(puter, ...args);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An unknown error occurred";
      setError(msg);
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
  });

  /**
   * Initializes the Puter store and checks for the Puter SDK.
   */
  const init = (): void => {
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
      clearInterval(interval);
      if (!getPuter()) {
        setError("Puter.js failed to load within 10 seconds");
      }
    }, 10000);
  };

  // Create safe actions for fs, ai, and kv using the helper
  const fsActions = {
    write: createPuterAction((puter, path, data) => puter.fs.write(path, data)),
    read: createPuterAction((puter, path) => puter.fs.read(path)),
    readDir: createPuterAction((puter, path) => puter.fs.readdir(path)),
    upload: createPuterAction((puter, files) => puter.fs.upload(files)),
    delete: createPuterAction((puter, path) => puter.fs.delete(path)),
  };

  const aiActions = {
    chat: createPuterAction((puter, prompt, imageURL, testMode, options) =>
      puter.ai.chat(prompt, imageURL, testMode, options)
    ),
    feedback: createPuterAction((puter, path, message) =>
      puter.ai.chat(
        [
          {
            role: "user",
            content: [
              { type: "file", puter_path: path },
              { type: "text", text: message },
            ],
          },
        ],
        { model: "claude-sonnet-4" }
      )
    ),
    img2txt: createPuterAction((puter, image, testMode) =>
      puter.ai.img2txt(image, testMode)
    ),
  };

  const kvActions = {
    get: createPuterAction((puter, key) => puter.kv.get(key)),
    set: createPuterAction((puter, key, value) => puter.kv.set(key, value)),
    delete: createPuterAction((puter, key) => puter.kv.delete(key)),
    list: createPuterAction((puter, pattern, returnValues) =>
      puter.kv.list(pattern, returnValues ?? false)
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
  };
});