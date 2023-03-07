import { Document } from "../document";


export class AlreadyExits extends Error {
	public constructor(
		public doc: Document.Cancelled | Document.Succeeded | Document.Failed,
	) { super(); }
}

export class NotFound extends Error { }

export class CancellationNotAllowed extends Error {
	public constructor(
		public doc: Document.Adopted,
	) { super(); }
}

export class Locked extends Error {
	public constructor(
		public doc: Document.Orphan | Document.Adopted,
	) { super(); }
}
