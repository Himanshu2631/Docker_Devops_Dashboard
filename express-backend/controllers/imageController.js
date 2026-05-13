const docker = require('../services/dockerService');

/**
 * imageController.js
 * Docker image management — list, remove, pull, inspect.
 */

/** GET /api/images — list all local images */
const listImages = async (req, res) => {
  try {
    const images = await docker.listImages({ all: false });

    const formatted = images.map(img => {
      const repoTag = img.RepoTags?.[0] || '<none>:<none>';
      const [repo, tag] = repoTag.includes(':') ? repoTag.split(':') : [repoTag, 'latest'];
      const sizeMB = (img.Size / 1024 / 1024).toFixed(1);
      const created = new Date(img.Created * 1000).toISOString();

      return {
        id:        img.Id.replace('sha256:', '').substring(0, 12),
        fullId:    img.Id,
        repo,
        tag:       tag || 'latest',
        repoTag,
        sizeMB:    parseFloat(sizeMB),
        sizeLabel: `${sizeMB} MB`,
        created,
        labels:    img.Labels || {},
        containers: 0, // enriched separately if needed
      };
    });

    return res.status(200).json({ success: true, total: formatted.length, data: formatted });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to list images', error: err.message });
  }
};

/** DELETE /api/images/:id — remove an image */
const removeImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = docker.getImage(id);
    await image.remove({ force: req.query.force === 'true' });
    return res.status(200).json({ success: true, message: `Image ${id} removed` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to remove image', error: err.message });
  }
};

/** GET /api/images/:id/inspect — full image metadata */
const inspectImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = docker.getImage(id);
    const data  = await image.inspect();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to inspect image', error: err.message });
  }
};

/** POST /api/images/pull — pull an image by name:tag */
const pullImage = async (req, res) => {
  try {
    const { image: name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Image name is required' });

    await new Promise((resolve, reject) => {
      docker.pull(name, (err, stream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, (fErr) => {
          if (fErr) reject(fErr); else resolve();
        });
      });
    });

    return res.status(200).json({ success: true, message: `Image ${name} pulled successfully` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to pull image', error: err.message });
  }
};

module.exports = { listImages, removeImage, inspectImage, pullImage };
