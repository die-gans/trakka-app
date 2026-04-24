import { signInWithGoogle } from '../lib/supabase'

export function Login() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-bg-base">
      <div className="w-[420px] border border-border-default bg-bg-surface p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-info">
          TRAKKA Command Centre
        </div>
        <div className="text-[22px] font-black uppercase tracking-[0.08em] text-text-primary">
          Roll Out
        </div>
        <div className="mt-2 text-[12px] leading-relaxed text-text-secondary">
          Coordinate your convoy. Track your troop. Keep everyone on the same page — literally.
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={signInWithGoogle}
            className="flex w-full items-center justify-center gap-3 border border-border-default bg-bg-panel px-4 py-3 text-[12px] font-bold text-text-primary transition-colors hover:border-info/50 hover:bg-bg-elevated"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>

        <div className="mt-4 text-[10px] text-text-muted">
          Your data is stored securely and only shared with trip members you invite.
        </div>
      </div>
    </div>
  )
}
