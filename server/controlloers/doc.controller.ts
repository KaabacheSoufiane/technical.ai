import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

export const uploadDoc = (req: Request, res: Response) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send('Aucun fichier envoyé.');
  }

  const file = req.files.file as fileUpload.UploadedFile;
  const savePath = path.join(UPLOAD_DIR, file.name);

  file.mv(savePath, err => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'Fichier uploadé avec succès.', name: file.name });
  });
};

export const listDocs = (req: Request, res: Response) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) return res.status(500).send('Erreur lors de la lecture des fichiers.');
    res.json(files);
  });
};
