const mongoose = require('mongoose');

const metricsSchema = new mongoose.Schema({
  loc: Number, sloc: Number, blankLines: Number,
  commentLines: Number, commentRatio: Number,
  functionCount: Number, avgFunctionLength: Number,
  halstead: {
    vocabulary: Number, length: Number, volume: Number,
    difficulty: Number, effort: Number, timeToProgram: Number, bugs: Number,
  },
  cyclomaticComplexity: {
    average: Number, max: Number,
    perFunction: [{ name: String, complexity: Number }],
  },
  informationFlow: { fanIn: Number, fanOut: Number, ifMetric: Number },
  oo: {
    classCount: Number, avgMethodsPerClass: Number,
    depthOfInheritanceTree: Number, couplingBetweenClasses: Number,
    lackOfCohesionInMethods: Number, weightedMethodsPerClass: Number,
    responsesForClass: Number,
  },
}, { _id: false });

const issueSchema = new mongoose.Schema({
  type: String,
  severity: { type: String, enum: ['critical', 'high', 'medium', 'low', 'info'], default: 'info' },
  title: String,
  description: String,
  line: Number,
  suggestion: String,
}, { _id: false });

const umlDiagramSchema = new mongoose.Schema({
  type: String, title: String, mermaid: String,
}, { _id: false });

// Test case schema — stores as plain object, no strict string casting
const testCaseSchema = new mongoose.Schema({
  description: String,
  type: String,
  code: String,
}, { _id: false });

const designPatternSchema = new mongoose.Schema({
  pattern: String,
  confidence: Number,
  location: String,
}, { _id: false });

const checklistItemSchema = new mongoose.Schema({
  item: String,
  passed: Boolean,
  note: String,
}, { _id: false });

const analysisSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId, ref: 'Project',
      required: true, index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,
    },
    version: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    errorMessage: String,
    metrics: metricsSchema,
    summary: String,
    language: String,
    frameworks: [String],
    codeQuality: {
      score: Number, maintainability: Number,
      readability: Number, testability: Number,
    },
    codeSmells:     [issueSchema],
    optimizations:  [issueSchema],
    refactoring:    [issueSchema],
    securityIssues: [issueSchema],
    designPatterns: [designPatternSchema],
    testCases:      [testCaseSchema],
    construction: {
      codingStandards:   [issueSchema],
      codeChecklist:     [checklistItemSchema],
      reviewSuggestions: [String],
      refactoringTips:   [String],
      optimizationTips:  [String],
    },
    umlDiagrams: [umlDiagramSchema],
    srs: { raw: String, generatedAt: Date, wordCount: Number },
    processingTime: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analysis', analysisSchema);