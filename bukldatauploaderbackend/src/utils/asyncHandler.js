export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export const asyncHandlerWithContext =
  (fn, context = "") =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      if (context) {
        console.error(`🚨 Error in ${context}:`, error.message)
      }
      next(error)
    })
  }

export const uploadAsyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    if (req.file && req.file.path) {
      const fs = require("fs")
      fs.unlink(req.file.path, (unlinkError) => {
        if (unlinkError) {
          console.error("🧹 Failed to cleanup uploaded file:", unlinkError.message)
        }
      })
    }
    next(error)
  })
}
