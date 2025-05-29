'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { CustomUploadThing } from '@/components/upload/uploadthing-custom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UploadTestPage() {
  const { data: session, status } = useSession();
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);

  const addTestResult = (test: string, result: any) => {
    setTestResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }]);
  };

  const testAPI = async () => {
    try {
      const response = await fetch('/api/uploadthing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'upload',
          files: [{ name: "test.jpg", size: 1000, type: "image/jpeg" }],
          input: {}
        })
      });
      
      const data = await response.text();
      addTestResult('API Test', { status: response.status, response: data });
    } catch (error: any) {
      addTestResult('API Test', { error: error.message });
    }
  };

  const testAuth = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const sessionData = await response.json();
      addTestResult('Auth Test', sessionData);
    } catch (error: any) {
      addTestResult('Auth Test', { error: error.message });
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Test & Debug Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Session Info</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify({ session, status }, null, 2)}
            </pre>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={testAuth}>Test Auth</Button>
            <Button onClick={testAPI}>Test API</Button>
          </div>
          
          {testResults.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold">Test Results</h3>
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="bg-gray-100 p-2 rounded">
                    <strong>{result.test}</strong> ({result.timestamp})
                    <pre className="text-sm mt-1">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload Test</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomUploadThing
            onUploadComplete={(urls) => {
              setUploadedUrls(prev => [...prev, ...urls]);
              addTestResult('Upload Success', { urls });
            }}
            onUploadError={(error) => {
              addTestResult('Upload Error', { 
                message: error.message, 
                name: error.name,
                stack: error.stack 
              });
            }}
            maxFiles={4}
            endpoint="testUploader"
          />
          
          {uploadedUrls.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Uploaded Images</h3>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {uploadedUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Uploaded ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
