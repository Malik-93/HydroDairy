// IMPORTANT: This is a placeholder authentication endpoint.
// You must implement your own logic to securely generate a token.
// NEVER expose your private key in client-side code.

import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!, // Replace with your actual private key
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export async function GET(request: Request) {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return NextResponse.json(authenticationParameters);
  } catch (error) {
    console.error('Error generating ImageKit auth params:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate with ImageKit.' },
      { status: 500 }
    );
  }
}
