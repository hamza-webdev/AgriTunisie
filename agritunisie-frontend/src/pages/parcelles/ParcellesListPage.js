// src/pages/parcelles/ParcellesListPage.js
export const ParcellesListPage = ({ navigateTo }) => {
    const [parcelles, setParcelles] = useState([]);
    const [loadingState, setLoadingState] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const { logout } = useAuth();

    const fetchParcelles = useCallback(async (page) => {
        setLoadingState(true); setError('');
        try {
            const data = await parcelleService.getUserParcelles(page);
            setParcelles(data.data);
            setPagination(data.pagination);
        } catch (err) {
            setError(err.message || "Erreur lors de la récupération des parcelles.");
            if (err.message.includes("401") || err.message.includes("Accès non autorisé")) { logout(); navigateTo('login'); }
        } finally { setLoadingState(false); }
    }, [logout, navigateTo]);

    useEffect(() => { fetchParcelles(currentPage); }, [fetchParcelles, currentPage]);

    const handleDelete = async (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette parcelle ?")) { // Remplacer par un Modal
            try {
                await parcelleService.deleteParcelle(id);
                setParcelles(parcelles.filter(p => p.id !== id));
                if (parcelles.length === 1 && currentPage > 1) { setCurrentPage(currentPage - 1); }
                else { fetchParcelles(currentPage); }
            } catch (err) { setError(err.message || "Erreur suppression parcelle."); }
        }
    };
    const handlePageChange = (newPage) => { if (pagination && newPage >= 1 && newPage <= pagination.totalPages) { setCurrentPage(newPage); } };

    if (loadingState) return <div className="flex justify-center mt-10"><LoadingSpinner size="lg" /></div>;
    return (
        <Card>
            <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-semibold text-gray-800">Mes Parcelles</h1><Button onClick={() => navigateTo('addParcelle')} variant="primary" Icon={PlusCircle}>Ajouter une Parcelle</Button></div>
            {error && <Alert message={error} type="error" onClose={() => setError('')} />}
            {parcelles.length === 0 && !loadingState && (<p className="text-gray-600 text-center py-10">Vous n'avez pas encore de parcelles enregistrées.</p>)}
            {parcelles.length > 0 && (<div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Superficie (ha)</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type de Sol</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{parcelles.map((parcelle) => (<tr key={parcelle.id}><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{parcelle.nom_parcelle}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parcelle.superficie_calculee_ha || 'N/A'}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parcelle.type_sol_predominant || 'N/A'}</td><td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"><Button onClick={() => navigateTo(`parcelleDetail/${parcelle.id}`)} variant="ghost" Icon={Eye} className="text-blue-600 hover:text-blue-800 p-1"><span className="sr-only">Voir</span></Button><Button onClick={() => navigateTo(`editParcelle/${parcelle.id}`)} variant="ghost" Icon={Edit3} className="text-yellow-600 hover:text-yellow-800 p-1"><span className="sr-only">Modifier</span></Button><Button onClick={() => handleDelete(parcelle.id)} variant="ghost" Icon={Trash2} className="text-red-600 hover:text-red-800 p-1"><span className="sr-only">Supprimer</span></Button></td></tr>))}</tbody></table></div>)}
            {pagination && pagination.totalPages > 1 && (<div className="mt-6 flex justify-center items-center space-x-2"><Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Précédent</Button><span className="text-sm text-gray-700">Page {currentPage} sur {pagination.totalPages}</span><Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.totalPages}>Suivant</Button></div>)}
        </Card>
    );
};
