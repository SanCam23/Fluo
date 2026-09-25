import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Fluo caught runtime error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('Could not clear localStorage:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-white/[0.08] backdrop-blur-2xl border border-white/20 shadow-2xl flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">Se detectó un problema</h2>
              <p className="mt-1 text-xs text-slate-300">
                Hubo un conflicto en el estado local de datos. Puedes restablecerlo con seguridad.
              </p>
            </div>

            {this.state.error && (
              <div className="w-full p-2.5 rounded-xl bg-black/40 text-left text-[11px] font-mono text-rose-300 overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <button
              type="button"
              onClick={this.handleReset}
              className="w-full py-3 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-400 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <RotateCcw className="h-4 w-4" />
              Restablecer y Recargar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
