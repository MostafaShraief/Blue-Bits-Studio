export interface Material {
    materialId: number;
    materialName: string;
    materialYear: number;
}

export interface Workflow {
    workflowId: number;
    systemCode: string;
    adminNote: string;
    isActive: number;
}

export interface File {
    fileId: number;
    sessionId: number;
    localFilePath: string;
    fileType: 'Image' | 'Docx' | 'Other';
    orderIndex: number;
}

export interface Note {
    noteId: number;
    sessionId: number;
    noteText: string;
    noteType: 'GeneralNote' | 'FileNote';
    fileId: number | null;
}

export interface SessionContent {
    contentId: number;
    sessionId: number;
    contentBody: string;
}

export interface Session {
    sessionId: number;
    userId: number;
    materialId: number;
    workflowId: number;
    lectureNumber: number;
    lectureType: 'Theoretical' | 'Practical';
    createdAt: string;
    
    // Navigational properties returned by GetSession
    material?: Material;
    workflow?: Workflow;
    notes?: Note[];
    files?: File[];
    sessionContents?: SessionContent[];
    compiledPrompt?: string;
}

export interface SessionSummary {
    sessionId: number;
    materialName: string;
    lectureNumber: number;
    type: string;
    workflowType: string;
    createdAt: string;
}
