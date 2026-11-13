const Job = require('../models/Job');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

// CRUD для jobs: кожен запит фільтрує по createdBy — юзер бачить лише свої job
const getAllJobs = async (req, res, next) => {
  const jobs = await Job.find({ createdBy: req.user.userId }).sort('createdAt'); // від старих до нових; [] якщо нема
  res.status(StatusCodes.OK).json({ jobs, count: jobs.length}); // count — зручно фронтенду
}

const getJob = async (req, res, next) => {
  const { user: { userId }, params: { id: jobId } } = req; // userId — з токена (auth), jobId — з URL /jobs/:id

  const job = await Job.findOne({ _id: jobId, createdBy: userId }); // обидві умови: чужу job не віддаємо
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`); // 404 і для неіснуючої, і для чужої — не підказуємо, що вона є
  }

  res.status(StatusCodes.OK).json({ job });
}

const createJob = async (req, res, next) => {
  req.body.createdBy = req.user.userId // власника беремо з токена, а не з тіла запиту
  const job = await Job.create(req.body) // валідація схеми; невідомі поля strict-режим відкине
  res.status(StatusCodes.CREATED).send(job)
}

const updateJob = async (req, res, next) => {
  const {
    body: { company, position },
    user: { userId },
    params: { id: jobId },
  } = req;

  if (company === '' || position === '') { // 400 з людським текстом ще до запиту в БД
    throw new BadRequestError('Company or Position fields cannot be empty');
  }

  const job = await Job.findOneAndUpdate(
    { _id: jobId, createdBy: userId }, // оновлюємо лише свою job
    req.body,
    { returnDocument: 'after', runValidators: true } // Mongoose 9: замість { new: true }; валідатори схеми й тут
  );
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }

  res.status(StatusCodes.OK).json({ job });
}

const deleteJob = async (req, res, next) => {
  const { user: { userId }, params: { id: jobId } } = req;

  const job = await Job.findOneAndDelete({ _id: jobId, createdBy: userId }); // findOneAndRemove прибрали в Mongoose 8+
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }

  res.status(StatusCodes.OK).send(); // тіло не потрібне — достатньо статусу
}

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob
}
