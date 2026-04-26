const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  originalName: String,
  storedName:   String,
  path:         String,
  size:         Number,
  mimetype:     String,
  content:      String,
}, { _id: false });

const projectSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', required: true, index: true,
    },
    title: {
      type: String, required: [true, 'Project title is required'],
      trim: true, maxlength: [120, 'Title too long'],
    },
    description: { type: String, maxlength: 2000 },
    techStack:   [{ type: String, trim: true }],
    githubUrl:   { type: String, trim: true },
    sourceCode:  { type: String },
    files:       [fileSchema],
    status: {
      type: String,
      enum: ['draft', 'analyzing', 'completed', 'failed'],
      default: 'draft',
    },
    lastAnalysedAt: { type: Date },
    analysisCount:  { type: Number, default: 0 },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

projectSchema.virtual('hasAnalysis', {
  ref: 'Analysis', localField: '_id', foreignField: 'project', justOne: true,
});

module.exports = mongoose.model('Project', projectSchema);