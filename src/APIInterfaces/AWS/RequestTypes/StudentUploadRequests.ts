export interface PutUploadWork {
    presignedUrl: URL;
    file: File;
    // Actually typed any by Axios.
    onUploadProgress?: (progressEvent: any) => void;
}
