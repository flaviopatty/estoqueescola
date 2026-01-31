import React, { useState } from 'react';
import { supabase } from '../supabase';
import { LogIn, UserPlus, Mail, Lock, Loader2, Warehouse } from 'lucide-react';

const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setError('Cadastro realizado! Verifique seu e-mail para confirmar.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro na autenticação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
            <div className="max-w-md w-full glass-card p-8 space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 mb-6">
                        <Warehouse className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
                        EduEstoque <span className="text-primary">Pro</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {isSignUp ? 'Crie sua conta para começar' : 'Entre na sua conta para continuar'}
                    </p>
                </div>

                {error && (
                    <div className={`p-4 rounded-xl text-sm ${error.includes('Cadastro') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'} border border-current/20`}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                <Mail className="h-5 w-5" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
                                placeholder="Seu e-mail profissional"
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
                                placeholder="Sua senha secreta"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center py-4 px-6 bg-primary hover:bg-primary/90 text-white rounded-2xl font-semibold shadow-xl shadow-primary/30 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:pointer-events-none group"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : isSignUp ? (
                            <UserPlus className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                        ) : (
                            <LogIn className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                        )}
                        {isSignUp ? 'Criar minha conta' : 'Entrar no sistema'}
                    </button>
                </form>

                <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary font-medium transition-colors"
                    >
                        {isSignUp
                            ? 'Já tem uma conta? Clique para entrar'
                            : 'Não tem conta? Crie uma agora'}
                    </button>
                </div>
            </div>

            <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 2rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
        }

        .dark .glass-card {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
      `}</style>
        </div>
    );
};

export default Auth;
