const express = require('express');
const router  = express.Router();
const { listImages, removeImage, inspectImage, pullImage } = require('../controllers/imageController');

router.get('/',           listImages);
router.post('/pull',      pullImage);
router.get('/:id/inspect', inspectImage);
router.delete('/:id',     removeImage);

module.exports = router;
