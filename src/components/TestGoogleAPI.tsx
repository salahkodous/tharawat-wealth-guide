import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const TestGoogleAPI = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testAPI = async (healthCheck = false) => {
    setTesting(true);
    setResult(null);
    
    try {
      console.log('=== Client: Starting Google Search API Test ===');
      console.log('Health check mode:', healthCheck);
      console.log('Invoking test-google-search function...');
      
      const { data, error } = await supabase.functions.invoke('test-google-search', {
        body: { 
          query: "EFG Hermes Egypt financial analysis",
          healthCheck: healthCheck
        }
      });

      console.log('=== Client: Function Response ===');
      console.log('Data:', data);
      console.log('Error:', error);
      console.log('Error details:', error ? JSON.stringify(error, null, 2) : 'No error');

      if (error) {
        console.error('Function invocation error:', error);
        setResult({ 
          success: false, 
          error: JSON.stringify(error, null, 2), 
          type: 'function_error',
          error_name: error.name,
          error_message: error.message,
          error_context: error.context,
          raw_error: error
        });
        toast.error('Function call failed: ' + (error.message || 'Unknown error'));
        return;
      }

      console.log('Function call successful, data received:', data);
      setResult(data);
      
      if (data?.success) {
        toast.success('Google Search API working!');
      } else {
        toast.error('Google Search API failed: ' + (data?.message || 'Unknown reason'));
      }
    } catch (err) {
      console.error('=== Client: Unexpected error ===', err);
      setResult({ 
        success: false, 
        error: (err as Error).message, 
        type: 'unexpected_error',
        stack: (err as Error).stack
      });
      toast.error('Unexpected error: ' + (err as Error).message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>🔧 Quick Google API Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={() => testAPI(true)} 
            disabled={testing}
            variant="outline"
            className="flex-1"
          >
            {testing ? 'Testing...' : 'Health Check'}
          </Button>
          <Button 
            onClick={() => testAPI(false)} 
            disabled={testing}
            className="flex-1"
          >
            {testing ? 'Testing...' : 'Full API Test'}
          </Button>
        </div>

        {result && (
          <div className="p-4 bg-muted rounded-lg">
            <pre className="text-xs overflow-auto max-h-64">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};