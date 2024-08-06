const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const config = require('../config.js');
const jwt = require('jsonwebtoken');
const { checkSuperAdmin,checkOwner } = require('../middlewares/authMiddleware.js');
const bcrypt = require('bcryptjs');
const Store = require('../models/store.js');
const { sendWelcomeEmail } = require('../emailService.js'); 
const Mail = require('nodemailer/lib/mailer/index.js');
const { sendForgetpassword } = require('../emailService.js'); 
const fs = require('fs');
const path = require('path');
const { sendVerification } = require('../emailService.js'); 
router.use(express.json()); 
const multer = require('multer');
const mime = require('mime');
const Company = require('../models/company.js');

function deleteUploadedFile(filePath) {
  return new Promise((resolve, reject) => {
    // Vérifier si le fichier existe
    if (fs.existsSync(filePath)) {
      // Supprimer le fichier
      fs.unlink(filePath, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    } else {
      // Le fichier n'existe pas
      reject(new Error('Le fichier spécifié n\'existe pas'));
    }
  });
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the destination folder where uploaded files will be stored
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const date = new Date().toISOString().split('T')[0]; // Get the current date in YYYY-MM-DD format
    const originalname = file.originalname; // Get the original name of the file
    const extension = path.extname(originalname); // Get the file extension
    const filename = originalname.split('.')[0]; // Get the file name without the extension
    const uniqueSuffix = date + '-' + Date.now(); // Generate a unique suffix using the date and current timestamp
    const newFilename = filename + '-' + uniqueSuffix + extension; // Combine the file name, unique suffix, and extension

    cb(null, newFilename);
  }
});
// Create the multer upload instance
const upload = multer({ storage: storage });
const storageProfil = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the destination folder where uploaded files will be stored
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const { originalname } = file;
    const fileExtension = (originalname.match(/\.+[\S]+$/) || [])[0];
    cb(null, `${file.fieldname}__${Date.now()}${fileExtension}`);
    // const originalname = file.originalname; // Get the original name of the file
    // const extension = path.extname(originalname); // Get the file extension
    // const filename = originalname.split('.')[0]; // Get the file name without the extension

    // const newFilename = filename + extension; // Combine the file name, unique suffix, and extension
  
   // cb(null, file.originalname);
  }
});
const uploadIamgeProfil = multer({ storage: storageProfil });

function sendNotification(title, message) {
  // Logique pour envoyer la notification
  // Remplacez cette partie avec votre propre code d'envoi de notification
  console.log(`Notification - Titre: ${title}, Message: ${message}`);
}


router.use((err, req, res, next) => {
  console.error(err); // Afficher l'erreur dans la console

  // Envoyer une réponse d'erreur appropriée au client
  res.status(500).json({ message: 'Une erreur est survenue sur le serveur' });
});


router.post('/addAdmin',checkSuperAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;

    const saltRounds = 10; // Nombre de tours de salt

    // Vérifier si l'utilisateur avec l'email donné existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }

    // Créer un nouvel admin
    const admin = new User({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      role: 'admin'
    });

    // Générer le hachage du mot de passe avec un salt
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Assigner le mot de passe haché à l'admin
    admin.password = hashedPassword;

    // Enregistrer le nouvel admin dans la base de données
    await admin.save();

    res.status(201).json({ message: 'Admin ajouté avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de l\'ajout de l\'admin' });
  }
});


router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    // Vérifier si le mot de passe est correct
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }
    // Générer un jeton JWT
    const token = jwt.sign({ id: user._id, role: user.role }, config.secret);

    // Envoyer le jeton JWT à l'utilisateur
    res.json({ token, user });
    console.log(user);
  } catch (error) {
    next(error); // Passer l'erreur au middleware de capture des erreurs
  }
});
router.put('/verification/:id', async (req, res) => {
  try {
    const ownerId = req.params.id;
 console.log(ownerId);
    // Vérifier si le propriétaire existe
    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: 'Propriétaire non trouvé' });
    }

    // Mettre à jour le statut du propriétaire
    owner.verifid = true;
    await owner.save();

    res.json({ message: 'Propriétaire verifie' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la suspension du propriétaire' });
  }
});
router.post('/sendVerification/:id', async (req, res, next) => {
  try {
    const ownerId = req.params.id;
    console.log(ownerId);

    // Vérifier si l'utilisateur existe
    const user = await User.findById(ownerId);
    if (!user) {
      return res.status(404).json({ message: 'Propriétaire non trouvé' });
    }

    // Vérifier si le mot de passe est correct
   
    // Générer un jeton JWT
    const token = jwt.sign({ id: user._id, role: user.role }, config.secret);

    // Envoyer le jeton JWT à l'utilisateur
    res.json({ token, user });
    sendVerification(user.email,user.id,token);
  } catch (error) {
    next(error); // Passer l'erreur au middleware de capture des erreurs
  }
});
router.post('/forgetPassword', async (req, res, next) => {
  try {
    const { email } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    // Vérifier si le mot de passe est correct
   
    // Générer un jeton JWT
    const token = jwt.sign({ id: user._id, role: user.role }, config.secret);

    // Envoyer le jeton JWT à l'utilisateur
    res.json({ token, user });
    sendForgetpassword(email,user.id,token);
  } catch (error) {
    next(error); // Passer l'erreur au middleware de capture des erreurs
  }
});


router.put('/resetPassword/:id',checkOwner,  async (req, res) => {
  const { id } = req.params;
  const {password } = req.body;
  const saltRounds = 10;
 console.log(id);
 console.log(password);
  try {
    // Retrieve user from the database based on the provided ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify if the provided current password matches the one stored in the database
    
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Assigner le mot de passe haché à l'admin

    // Hash the new password


    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();

    // Return a success response
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/addOwner',  upload.single('image'), async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, sexe } = req.body;

    const saltRounds = 10; // Nombre de tours de salt

    // Vérifier si l'owner existe déjà avec l'adresse e-mail fournie
    const existingOwner = await User.findOne({ email });
    if (existingOwner) {
      return res.status(400).json({ message: 'Un propriétaire avec cette adresse e-mail existe déjà' });
    }

    // Attribuer le chemin d'accès de l'image par défaut
    let image = 'images/default.png';

    // Check if an image was uploaded
    if (req.file) {
      // An image was uploaded, assign the uploaded image path
      image = req.file.path;
    }


    // Créer un nouvel owner avec l'image par défaut
    const owner = new User({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      role: 'owner',
      image,
      sexe
    });

    // Générer le hachage du mot de passe avec un salt
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Assigner le mot de passe haché à l'admin
    owner.password = hashedPassword;

    // Enregistrer le nouvel owner dans la base de données
    await owner.save();

    // Envoyer un e-mail de bienvenue à l'owner
   // sendWelcomeEmail(owner.email, owner.firstName, owner.lastName, password);
    //sendNotification('Nouvel owner ajouté', `Un nouvel owner a été ajouté : ${owner.firstName} ${owner.lastName}`);
    sendWelcomeEmail(owner.id,owner.email,owner.firstName,owner.lastName,password);

    res.status(201).json({ message: 'Owner ajouté avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de l\'ajout de l\'owner' });
  }
});

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const userId = req.body.userId; // Supposons que l'ID de l'utilisateur est envoyé dans le corps de la requête
    const userFolderPath = path.join('uploads', userId); // Construire le chemin du dossier de l'utilisateur

    // Vérifier si le dossier de l'utilisateur existe, sinon le créer
    if (!fs.existsSync(userFolderPath)) {
      fs.mkdirSync(userFolderPath);
    }

    if (req.file.size > 500 * 1024) {
      // Taille de fichier supérieure à 500 Ko
      return res.status(400).json({ error: 'La taille du fichier dépasse la limite autorisée.' });
    }

    const allowedMimeTypes = ['image/jpg', 'image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      // Type de fichier non autorisé
      return res.status(400).json({ error: 'Seuls les fichiers PNG, JPEG, WebP, PDF et DOCX sont autorisés.' });
    }

    // Déplacer le fichier téléchargé dans le dossier de l'utilisateur
    const destinationPath = path.join(userFolderPath, req.file.filename);
    fs.renameSync(req.file.path, destinationPath);

    res.status(200).json({ message: 'Fichier téléchargé avec succès' });
    console.log('uploaded');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Échec du téléchargement du fichier' });
  }
});
router.post('/uploadIamgeProfil/:id', uploadIamgeProfil.single('image'), async (req, res) => {
  try {
    const userId = req.body.userId; // Supposons que l'ID de l'utilisateur est envoyé dans le corps de la requête
    const userFolderPath = path.join('uploads'); // Construire le chemin du dossier de l'utilisateur
    const ownerId = req.params.id;

    // Vérifier si le propriétaire existe
    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: 'Propriétaire non trouvé' });
    }
      console.log(req.file.filename);
    // Mettre à jour le statut du propriétaire
    owner.image = req.file.filename;
    await owner.save();
    res.json({ owner})
    // Vérifier si le dossier de l'utilisateur existe, sinon le créer
 

    if (req.file.size > 500 * 1024) {
      // Taille de fichier supérieure à 500 Ko
      return res.status(400).json({ error: 'La taille du fichier dépasse la limite autorisée.' });
    }

    const allowedMimeTypes = ['image/jpg', 'image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      // Type de fichier non autorisé
      return res.status(400).json({ error: 'Seuls les fichiers PNG, JPEG, WebP, PDF et DOCX sont autorisés.' });
    }

    // Déplacer le fichier téléchargé dans le dossier de l'utilisateur
    const destinationPath = path.join(userFolderPath, req.file.originalname);
    // fs.renameSync(req.file.path, destinationPath,{encoding: 'utf8'}

    // );

    //res.status(200).json({ message: 'Fichier téléchargé avec succès' });
    console.log('uploaded');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Échec du téléchargement du fichier' });
  }
});

router.get('/images/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const userFolderPath = path.join('uploads', userId);

    if (!fs.existsSync(userFolderPath)) {
      return res.status(404).json({ error: 'Dossier utilisateur non trouvé' });
    }

    fs.readdir(userFolderPath, (err, files) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur lors de la lecture du dossier utilisateur' });
      }

      const images = [];

      // Parcourir chaque fichier du dossier
      files.forEach(file => {
        const filePath = path.join(userFolderPath, file);

        // Obtenir les informations sur le fichier
        fs.stat(filePath, (err, stats) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur lors de la récupération des informations sur le fichier' });
          }

          const regex = /-(\d{4}-\d{2}-\d{2})-/;
          const match = file.match(regex);
          const date = match ? match[1] : '';
          const [name] = file.split('_');
          const extension = path.extname(file);
          const mimeType = mime.getType(extension);

          const image = {
            name: name,
            date: date,
            mimeType: mimeType,
            size: stats.size // Taille du fichier en octets
          };

          images.push(image);

          // Vérifier si c'est le dernier fichier
          if (images.length === files.length) {
            res.status(200).json({ images });
          }
        });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des images' });
  }
});

router.get('/Allimages', (req, res) => {
  const imagesFolder = path.join('uploads');

  fs.readdir(imagesFolder, (err, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de la lecture du dossier des images' });
    }

    const images = [];

    // Filtrer uniquement les fichiers image
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    files.forEach((file) => {
      const extension = path.extname(file).toLowerCase();
      if (imageExtensions.includes(extension)) {
        images.push(file);
      }
    });

    res.status(200).json({ images });
  });
});



router.delete('/deleteFile/:userId/:fileName', async (req, res) => {
  try {
    const userId = req.params.userId; // Récupérer l'ID de l'utilisateur
    const fileName = req.params.fileName; // Récupérer le nom du fichier

    const filePath = path.join('uploads', userId, fileName); // Construire le chemin complet du fichier

    // Supprimer le fichier
    await deleteUploadedFile(filePath);

    res.json({ message: 'Fichier supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la suppression du fichier' });
  }
});

router.get('/getOwners', checkSuperAdmin, async (req, res) => {
  try {
    // Récupérer tous les utilisateurs avec le rôle 'owner'
    const owners = await User.find({ role: 'owner' });
    const ownerCount = owners.length; // Obtenir le nombre d'owners


    res.json({ owners, ownerCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des owners' });
  }
});

router.get('/getOwnerById/:id', checkSuperAdmin, async (req, res) => {
  try {
    const ownerId = req.params.id;

    // Retrieve the owner from the database based on the provided ID
    const owner = await User.findById(ownerId);

    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    res.json(owner);
    console.log(owner);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while retrieving the owner' });
  }
});

router.put('/suspendOwner/:id', checkSuperAdmin, async (req, res) => {
  try {
    const ownerId = req.params.id;

    // Vérifier si le propriétaire existe
    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: 'Propriétaire non trouvé' });
    }

    // Mettre à jour le statut du propriétaire
    owner.status = 'suspended';
    await owner.save();

    res.json({ message: 'Propriétaire suspendu avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la suspension du propriétaire' });
  }
});

router.put('/reactivateOwner/:id', checkSuperAdmin, async (req, res) => {
  try {
    const ownerId = req.params.id;

    // Vérifier si le propriétaire existe
    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: 'Propriétaire non trouvé' });
    }

    
    // Réactiver le propriétaire en mettant à jour son statut
    owner.status = 'active';
    await owner.save();

    res.json({ message: 'Propriétaire réactivé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la réactivation du propriétaire' });
  }
});

router.get('/getAllStores', checkSuperAdmin, async (req, res) => {
  try {
    // Récupérer tous les stores de la base de données
    const stores = await Store.find();

    res.json({ stores });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des stores' });
  }
});

router.get('/adminProfile', checkSuperAdmin, async (req, res) => {
  try {
    // Récupérer l'ID de l'admin à partir du token d'authentification
    const adminId = req.user.id;

    // Récupérer l'admin à partir de la base de données en utilisant l'ID
    const admin = await User.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json(admin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while retrieving the admin profile' });
  }
});

router.put('/updateAdminProfile', checkSuperAdmin, async (req, res) => {
  try {
    // Récupérer l'ID de l'admin à partir du token d'authentification
    const adminId = req.user.id;

    // Récupérer les nouvelles données du profil depuis le corps de la requête
    const { firstName, lastName, phoneNumber } = req.body;

    // Récupérer l'admin à partir de la base de données en utilisant l'ID
    const admin = await User.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Mettre à jour les propriétés du profil de l'admin
    admin.firstName = firstName;
    admin.lastName = lastName;
    admin.phoneNumber = phoneNumber;

    // Sauvegarder les modifications dans la base de données
    await admin.save();

    res.json({ message: 'Admin profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating admin profile' });
  }
});

// Service pour récupérer le nom du propriétaire d'un store
router.get('/getOwnerName/:storeId', checkSuperAdmin, async (req, res) => {
  try {
    const storeId = req.params.storeId;

    // Vérifier si le store existe
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store non trouvé' });
    }

    // Récupérer le propriétaire du store
    const owner = await User.findById(store.owner);
    if (!owner) {
      return res.status(404).json({ message: 'Propriétaire non trouvé' });
    }

    // Renvoyer le nom du propriétaire
    const ownerName = `${owner.firstName} ${owner.lastName}`;
    res.json({ ownerName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération du nom du propriétaire' });
  }
});

router.put('/approveStore/:storeId', checkSuperAdmin, async (req, res) => {
  try {
    const storeId = req.params.storeId;

    // Vérifier si le store existe
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store non trouvé' });
    }

    // Mettre à jour le statut du store en "active"
    store.status = 'active';
    await store.save();

    res.json({ message: 'Store approuvé avec succès', store });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de l\'approbation du store' });
  }
});

router.put('/rejeterStore/:storeId', checkSuperAdmin, async (req, res) => {
  try {
    const storeId = req.params.storeId;

    // Vérifier si le store existe
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store non trouvé' });
    }

    // Mettre à jour le statut du store en "active"
    store.status = 'rejected';
    await store.save();

    res.json({ message: 'Store rejected avec succès', store });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de l\'rejet du store' });
  }
});

router.get('/activeStores',checkSuperAdmin, async (req, res) => {
  try {
    // Récupérer tous les stores avec le statut "active"
    const stores = await Store.find({ status: 'active' });

    res.json({ stores });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des stores actifs' });
  }
});

router.get('/pendingStores',checkSuperAdmin, async (req, res) => {
  try {
    // Récupérer tous les stores avec le statut "pending"
    const stores = await Store.find({ status: 'pending' });

    res.json({ stores });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des stores pending' });
  }
});

router.get('/suspendedStores',checkSuperAdmin, async (req, res) => {
  try {
    // Récupérer tous les stores avec le statut "suspended"
    const stores = await Store.find({ status: 'suspended' });

    res.json({ stores });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des stores suspended' });
  }
});

router.get('/rejectedStores',checkSuperAdmin, async (req, res) => {
  try {
    // Récupérer tous les stores avec le statut "rejected"
    const stores = await Store.find({ status: 'rejected' });

    res.json({ stores });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des stores rejected' });
  }
});

router.delete('/deleteStores/:storeId',checkSuperAdmin, async (req, res) => {
  try {
    const storeId = req.params.storeId;

    // Vérifier si le magasin existe
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    // Supprimer le magasin de la base de données
    await Store.findByIdAndRemove(storeId);

    res.json({ message: 'Magasin supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la suppression du magasin' });
  }
});

// Service pour suspendre un magasin (store) par son ID
router.put('/suspendStores/:storeId',checkSuperAdmin, async (req, res) => {
  try {
    const storeId = req.params.storeId;

    // Vérifier si le magasin existe
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    // Mettre à jour le statut du magasin en "suspended"
    store.status = 'suspended';
    await store.save();

    res.json({ message: 'Magasin suspendu avec succès', store });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la suspension du magasin' });
  }
});

router.put('/activateStore/:storeId', checkSuperAdmin, async (req, res) => {
  try {
    const storeId = req.params.storeId;

    // Vérifier si le magasin existe
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    // Mettre à jour le statut du magasin en "active"
    store.status = 'active';
    await store.save();

    res.json({ message: 'Magasin activé avec succès', store });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de l\'activation du magasin' });
  }
});

router.delete('/deleteOwner/:ownerId', checkSuperAdmin, async (req, res) => {
  try {
    const ownerId = req.params.ownerId;

    // Vérifier si le propriétaire existe
    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: 'Propriétaire non trouvé' });
    }

    // Supprimer le propriétaire de la base de données
    await User.findByIdAndRemove(ownerId);

    res.json({ message: 'Propriétaire supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la suppression du propriétaire' });
  }
});

//get all companies
router.get("/companies", async (req, res) => {
  const companies = await Company.find();
  res.send(companies);
});

module.exports = router;
