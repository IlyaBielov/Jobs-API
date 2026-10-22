const express = require('express');
const router = express.Router();

const { getAllJobs, getJob, createJob, updateJob, deleteJob } = require('../controllers/jobs');

router.get('/', getAllJobs);
router.post('/', createJob);
router.get('/:id', getJob); // :id → req.params.id
router.delete('/:id', deleteJob);
router.patch('/:id', updateJob); // PATCH — часткове оновлення (лише передані поля)

module.exports = router;
