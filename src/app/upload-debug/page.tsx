"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CustomUploadThing } from "@/components/upload/uploadthing-custom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function UploadDebugPage() {
  const { data: session, status } = useSession();
  const [uploadResults, setUploadResults] = useState<string[]>([]);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
  };

  const handleUploadComplete = (urls: string[]) => {
    addDebugLog(`Upload completed successfully with ${urls.length} files`);
    setUploadResults(urls);
  };

  const handleUploadError = (error: Error) => {
    addDebugLog(`Upload failed with error: ${error.name} - ${error.message}`);
    console.error("Upload debug error:", error);
  };

  const clearLogs = () => {
    setDebugLogs([]);
    setUploadResults([]);
  };

  const testAuth = async () => {
    try {
      addDebugLog("Testing authentication...");
      const response = await fetch("/api/test", {
        method: "GET",
        credentials: "include"
      });
      const result = await response.json();
      addDebugLog(`Auth test result: ${JSON.stringify(result)}`);
    } catch (error) {
      addDebugLog(`Auth test failed: ${error}`);
    }
  };

  const testUploadThingEndpoint = async () => {
    try {
      addDebugLog("Testing UploadThing endpoint...");
      const response = await fetch("/api/uploadthing", {
        method: "GET",
        credentials: "include"
      });
      addDebugLog(`UploadThing endpoint status: ${response.status}`);
      const text = await response.text();
      addDebugLog(`UploadThing endpoint response: ${text.substring(0, 200)}...`);
    } catch (error) {
      addDebugLog(`UploadThing endpoint test failed: ${error}`);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">UploadThing Debug Page</h1>
        <Button onClick={clearLogs} variant="outline">
          Clear Logs
        </Button>
      </div>

      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle>Session Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Status:</strong> <Badge variant={status === "authenticated" ? "default" : "destructive"}>{status}</Badge></p>
            {session && (
              <>
                <p><strong>User:</strong> {session.user?.email}</p>
                <p><strong>Role:</strong> <Badge variant={session.user?.role === "ADMIN" ? "default" : "secondary"}>{session.user?.role}</Badge></p>
                <p><strong>ID:</strong> {session.user?.id}</p>
              </>
            )}
          </div>
          <div className="mt-4 space-x-2">
            <Button onClick={testAuth} size="sm">Test Auth API</Button>
            <Button onClick={testUploadThingEndpoint} size="sm">Test UploadThing Endpoint</Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Component */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Test (imageUploader)</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomUploadThing
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            maxFiles={4}
            endpoint="imageUploader"
          />
        </CardContent>
      </Card>

      {/* Test Uploader */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Test (testUploader - No Auth)</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomUploadThing
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            maxFiles={3}
            endpoint="testUploader"
          />
        </CardContent>
      </Card>

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadResults.map((url, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Badge>{index + 1}</Badge>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {url}
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto">
            {debugLogs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              <div className="space-y-1">
                {debugLogs.map((log, index) => (
                  <div key={index} className="text-sm font-mono">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Current URL:</strong> {mounted ? window.location.href : "Loading..."}</p>
            <p><strong>User Agent:</strong> {mounted ? navigator.userAgent : "Loading..."}</p>
            <p><strong>Cookies Enabled:</strong> {mounted ? navigator.cookieEnabled.toString() : "Loading..."}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
