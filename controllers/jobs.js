// заглушки: перевіряємо роутинг, CRUD з Job-моделлю допишемо пізніше
const getAllJobs = async (req, res, next) => {
  res.send('getAllJobs')
}

const getJob = async (req, res, next) => {
  res.send('getJob')
}

const createJob = async (req, res, next) => {
  res.send('createJob')
}

const updateJob = async (req, res, next) => {
  res.send('updateJobc')
}

const deleteJob = async (req, res, next) => {
  res.send('deleteJob')
}

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob
}
