import React, {useCallback, CSSProperties} from 'react'
import {useDropzone} from 'react-dropzone'
import AxiosRequest from '../Hooks/AxiosRequest';
import Cookies from 'js-cookie';
import { CookieEnum } from '../Enums/CookieEnum';

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

export const Upload: React.FC<UploadProps> = () => {
  const userId: string | undefined = Cookies.get(CookieEnum.USERID);
  console.log(CookieEnum)
  const onDrop = useCallback(acceptedFiles => {
    console.log(acceptedFiles);
        console.log(acceptedFiles[0]['name']);
        (async () => {
            const data = new FormData();
            data.append(acceptedFiles[0]['name'], acceptedFiles[0]);
            const pre_sign_url = await AxiosRequest.get('/student-work/presign-url');
            console.log('Response: ', pre_sign_url.data.data.data)
            const res = await AxiosRequest.put(pre_sign_url.data.data.data.uploadURL, data, {
                headers: {
                    'Content-Type': 'application/pdf'
                }
            });
            console.log("sent")
            const update_db = await AxiosRequest.post(`/student-work/post-path`, {userId: userId,
                                                     file_path:pre_sign_url.data.data.data.photoFilename});
            console.log(update_db)
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