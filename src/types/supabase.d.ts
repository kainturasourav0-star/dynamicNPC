declare module "@supabase/ssr" {
  export interface CookieMethodsServer {
    getAll?: () => Array<{ name: string; value: string }> | Promise<Array<{ name: string; value: string }>>;
    setAll?: (cookiesToSet: Array<{ name: string; value: string; options?: any }>) => void | Promise<void>;
    get?: (name: string) => { name: string; value: string } | undefined | Promise<{ name: string; value: string } | undefined>;
    set?: (name: string, value: string, options?: any) => void | Promise<void>;
    remove?: (name: string, options?: any) => void | Promise<void>;
  }

  export function createBrowserClient<Database = any>(
    supabaseUrl: string,
    supabaseKey: string,
    options?: any
  ): any;

  export function createServerClient<Database = any>(
    supabaseUrl: string,
    supabaseKey: string,
    options: {
      cookies: CookieMethodsServer;
      [key: string]: any;
    }
  ): any;
}
