export interface PutUploadWork {
    presignedUrl: URL;
    file: File;
    onUploadProgress: (progressEvent: any) => void;
}