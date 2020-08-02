import React, {useCallback, CSSProperties} from 'react'
import {useDropzone} from 'react-dropzone'
import AxiosRequest from '../Hooks/AxiosRequest';

export interface StylesDictionary{
    [Key: string]: CSSProperties;
}

const styles:StylesDictionary  = {
    someStyle:{
        display:'flex',
        justifyContent:'center',
        width: '800px',
        height: '50px',
        border: '4px dashed #4aa1f3', 
    }
}

interface UploadProps {}
const API_ENDPOINT = 'https://d59vl80zk0.execute-api.us-east-2.amazonaws.com/Prod'

export const Upload: React.FC<UploadProps> = () => {

  const onDrop = useCallback(acceptedFiles => {
    console.log(acceptedFiles);
        console.log(acceptedFiles[0]['name']);
        (async () => {
            const data = new FormData();
            data.append(acceptedFiles[0]['name'], acceptedFiles[0]);
            const pre_sign_url = await AxiosRequest.get(API_ENDPOINT);
            console.log('Response: ', pre_sign_url.data)
             const res2 = await AxiosRequest.put(pre_sign_url.data.uploadURL, data, {
                headers: {
                    'Content-Type': 'application/pdf'
                }
            });
            console.log(acceptedFiles[0]['name']);        
        })();
  }, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  return (
    <div style={styles.someStyle} {...getRootProps()}>
      <input {...getInputProps()} />
      {
        isDragActive ?
        <div>Drop the files here ...</div> :
          <p>Drag 'n' drop some files here, or click to select files</p>
      }
    </div>
  )
}
export default Upload;