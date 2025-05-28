// backend/src/controllers/elevage.controller.js
const elevageServiceInstance = new (require('../services/elevage.service'))();

exports.getTypesAnimaux = async (req, res, next) => {
    const { page, limit } = req.query;
    try {
        const result = await elevageServiceInstance.getTypesAnimaux({ page: parseInt(page) || 1, limit: parseInt(limit) || 10 });
        res.status(200).json(result);
    } catch (error) { next(error); }
};
exports.addAnimalUtilisateur = async (req, res, next) => {
    try {
        const animal = await elevageServiceInstance.addAnimalUtilisateur(req.user.id, req.body);
        res.status(201).json(animal);
    } catch (error) {
        if (error.code === '23503') return res.status(400).json({ message: "Type d'animal invalide." }); // Foreign key violation
        next(error);
    }
};
exports.getAnimauxUtilisateur = async (req, res, next) => {
    const { page, limit } = req.query;
    try {
        const result = await elevageServiceInstance.getAnimauxUtilisateur(req.user.id, { page: parseInt(page) || 1, limit: parseInt(limit) || 10 });
        res.status(200).json(result);
    } catch (error) { next(error); }
};
exports.getAnimalUtilisateur = async (req, res, next) => {
    try {
        const animal = await elevageServiceInstance.getAnimalUtilisateurById(req.params.id, req.user.id);
        if (!animal) return res.status(404).json({ message: "Animal non trouvé ou accès non autorisé." });
        res.status(200).json(animal);
    } catch (error) { next(error); }
};
exports.updateAnimalUtilisateur = async (req, res, next) => {
    try {
        const animal = await elevageServiceInstance.updateAnimalUtilisateur(req.params.id, req.user.id, req.body);
        if (!animal) return res.status(404).json({ message: "Animal non trouvé ou accès non autorisé pour la mise à jour." });
        res.status(200).json(animal);
    } catch (error) {
        if (error.status === 400) return res.status(400).json({ message: error.message });
        if (error.code === '23503') return res.status(400).json({ message: "Type d'animal invalide pour la mise à jour." });
        next(error);
    }
};
exports.deleteAnimalUtilisateur = async (req, res, next) => {
    try {
        const deleted = await elevageServiceInstance.deleteAnimalUtilisateur(req.params.id, req.user.id);
        if (!deleted) return res.status(404).json({ message: "Animal non trouvé ou accès non autorisé pour la suppression." });
        res.status(200).json({ message: "Animal supprimé avec succès." });
    } catch (error) { next(error); }
};