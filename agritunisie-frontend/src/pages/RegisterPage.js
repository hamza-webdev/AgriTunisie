// src/pages/RegisterPage.js
export const RegisterPage = ({ navigateTo }) => {
    const [nomComplet, setNomComplet] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [numeroTelephone, setNumeroTelephone] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loadingState, setLoadingState] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) { setError("Les mots de passe ne correspondent pas."); return; }
        setError(''); setSuccess(''); setLoadingState(true);
        try {
            await register({ nom_complet: nomComplet, email, mot_de_passe: password, numero_telephone: numeroTelephone });
            setSuccess("Inscription réussie ! Vous pouvez maintenant vous connecter.");
            setTimeout(() => navigateTo('login'), 2000);
        } catch (err) {
            setError(err.message || 'Erreur lors de l\'inscription.');
        } finally {
            setLoadingState(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <Card>
                <div className="text-center mb-6"><UserPlus size={48} className="mx-auto text-green-600" /><h2 className="text-2xl font-bold text-gray-800 mt-2">Inscription</h2></div>
                {error && <Alert message={error} type="error" onClose={() => setError('')} />}
                {success && <Alert message={success} type="success" onClose={() => setSuccess('')} />}
                <form onSubmit={handleSubmit}>
                    <Input label="Nom complet" name="nomComplet" value={nomComplet} onChange={(e) => setNomComplet(e.target.value)} required />
                    <Input label="Email" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <Input label="Numéro de téléphone (Optionnel)" name="numeroTelephone" value={numeroTelephone} onChange={(e) => setNumeroTelephone(e.target.value)} />
                    <Input label="Mot de passe" type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <Input label="Confirmer le mot de passe" type="password" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    <Button type="submit" variant="primary" className="w-full" disabled={loadingState} Icon={loadingState ? null : UserPlus}>{loadingState ? <LoadingSpinner size="sm" /> : 'S\'inscrire'}</Button>
                </form>
                <p className="text-sm text-center mt-4">Déjà un compte ? <button onClick={() => navigateTo('login')} className="font-medium text-green-600 hover:text-green-500">Connectez-vous</button></p>
            </Card>
        </div>
    );
};