// src/pages/LoginPage.js
export const LoginPage = ({ navigateTo }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loadingState, setLoadingState] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoadingState(true);
        try {
            await login(email, password);
            navigateTo('dashboard');
        } catch (err) {
            setError(err.message || 'Erreur de connexion. Veuillez vérifier vos identifiants.');
        } finally {
            setLoadingState(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <Card>
                <div className="text-center mb-6"><LogIn size={48} className="mx-auto text-green-600" /><h2 className="text-2xl font-bold text-gray-800 mt-2">Connexion</h2></div>
                {error && <Alert message={error} type="error" onClose={() => setError('')} />}
                <form onSubmit={handleSubmit}>
                    <Input label="Email" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <Input label="Mot de passe" type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <Button type="submit" variant="primary" className="w-full" disabled={loadingState} Icon={loadingState ? null : LogIn}>{loadingState ? <LoadingSpinner size="sm" /> : 'Se Connecter'}</Button>
                </form>
                <p className="text-sm text-center mt-4">Pas encore de compte ? <button onClick={() => navigateTo('register')} className="font-medium text-green-600 hover:text-green-500">Inscrivez-vous</button></p>
            </Card>
        </div>
    );
};