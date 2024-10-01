const jwt = require('jsonwebtoken');

// Middleware pour vérifier le token JWT et son rôle ID
function verifyTokenAndRole(token) {
    console.log("dedede")
    return (req, res, next) => {
        // Récupérer le token JWT de l'en-tête Authorization
        const authHeader = req.headers['authorization'];
        console.log("lala")
        // Vérifier si le token existe et est au format "Bearer <token>"
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Accès non autorisé. Format du token incorrect.' });
        }
 
        // Extraire le token
        const token = authHeader.split(' ')[1];

            console.log("ici")
        // Vérifier le token JWT
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Token invalide.' });
            } else {
               return res.status(200).json({message: "message"});
            }
        });
    };
}

module.exports = verifyTokenAndRole;
