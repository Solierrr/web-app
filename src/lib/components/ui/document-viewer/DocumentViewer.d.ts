export interface ViewerDocument { id: string; name: string; contentType?: string }
export interface DocumentViewerProps { document: ViewerDocument; load: (id: string) => Promise<Blob> }
