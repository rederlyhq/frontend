export const readFileAsText = (file: File) => new Promise<string | null>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
        const fileContent: string | ArrayBuffer | null | undefined = event.target?.result;
        // I don't think it can be array buffer, I think arrayBuffer is other read operations (not readAsText)
        resolve(fileContent?.toString() ?? null);
    });
    reader.addEventListener('error', error => reject(error));
    reader.readAsText(file);
});
