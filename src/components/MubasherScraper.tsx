import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ScrapeResult {
  success: boolean;
  message: string;
  crawled_pages?: number;
  extracted_stocks?: number;
  stored_stocks?: number;
  error?: string;
}

export const MubasherScraper = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const { toast } = useToast();

  const handleScrape = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('mubasher-scraper', {
        body: {}
      });

      if (error) {
        throw new Error(error.message);
      }

      setResult(data);

      if (data.success) {
        toast({
          title: "Scraping Successful",
          description: `Scraped and stored ${data.stored_stocks} Egyptian stocks`,
          duration: 5000,
        });
      } else {
        toast({
          title: "Scraping Warning",
          description: data.message,
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setResult({
        success: false,
        message: errorMessage,
        error: errorMessage
      });
      
      toast({
        title: "Scraping Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Mubasher Egypt Stocks Scraper
        </CardTitle>
        <CardDescription>
          Scrape Egyptian stock data from Mubasher.info and populate the database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ExternalLink className="h-4 w-4" />
          <span>Source: https://www.mubasher.info/countries/eg/companies</span>
        </div>

        <Button 
          onClick={handleScrape} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scraping in progress...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Start Scraping
            </>
          )}
        </Button>

        {result && (
          <Alert className={result.success ? "border-green-500" : "border-red-500"}>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">{result.message}</p>
                {result.crawled_pages && (
                  <p className="text-sm">Pages crawled: {result.crawled_pages}</p>
                )}
                {result.extracted_stocks && (
                  <p className="text-sm">Stocks extracted: {result.extracted_stocks}</p>
                )}
                {result.stored_stocks && (
                  <p className="text-sm">Stocks stored: {result.stored_stocks}</p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground mt-4">
          <p>This tool uses Firecrawl to scrape the Mubasher Egypt companies page and extract stock data.</p>
          <p>The data is then stored in the "mupashir_egypt_stocks" table with proper validation and deduplication.</p>
        </div>
      </CardContent>
    </Card>
  );
};