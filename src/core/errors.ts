export class QuickStackError extends Error {
	constructor(message: string, options?: { cause?: unknown }) {
		super(message, options);
		this.name = "QuickStackError";
	}
}

export class PipelineError extends QuickStackError {
	constructor(message: string, options?: { cause?: unknown }) {
		super(message, options);
		this.name = "PipelineError";
	}
}

export class ValidationError extends QuickStackError {
	constructor(message: string, options?: { cause?: unknown }) {
		super(message, options);
		this.name = "ValidationError";
	}
}
