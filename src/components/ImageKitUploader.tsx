
"use client";

import { IKContext, IKUpload } from 'imagekitio-react';
import { useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Loader2, UploadCloud } from 'lucide-react';

interface ImageKitUploaderProps {
  onSuccess: (result: any) => void;
  onError: (error: any) => void;
}

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
const authenticator = async () => {
    const response = await fetch('/api/imagekit/auth');
    return await response.json();
};

export function ImageKitUploader({ onSuccess, onError }: ImageKitUploaderProps) {
  const ikUploadRef = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!urlEndpoint || !publicKey) {
    return (
        <div className="p-4 border rounded-md bg-destructive/10 text-destructive">
            <p className="font-bold">ImageKit not configured</p>
            <p className="text-xs">Please set NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT and NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY in your .env file.</p>
        </div>
    )
  }

  return (
    <IKContext
      urlEndpoint={urlEndpoint}
      publicKey={publicKey}
      authenticator={authenticator}
    >
      <IKUpload
        hidden
        ref={ikUploadRef}
        onError={onError}
        onSuccess={onSuccess}
        useUniqueFileName={true}
        folder={"/household-tracker/"}
        responseFields={["isPrivateFile", "tags", "customCoordinates", "metadata"]}
      />
      
      {isMounted && ikUploadRef.current ? (
         <Button type="button" onClick={() => ikUploadRef.current?.click()}>
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload File
        </Button>
      ) : (
         <Button type="button" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading Uploader...
        </Button>
      )}
    </IKContext>
  );
}
