
import React, { useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal, Send, ExternalLink } from 'lucide-react';
import { deepLinkRouter } from '@/services/deepLinkRouter';

const DebugPage: React.FC = () => {
  const [testUrl, setTestUrl] = useState('shawarma://items/1');

  const handleTest = () => {
    deepLinkRouter.handle(testUrl);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center space-x-2 mb-8">
          <Terminal className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Debug Screen</h1>
        </div>

        <Card className="border-red-200 bg-red-50/10">
          <CardHeader>
            <CardTitle className="text-lg">Тестування Deep Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-text-light">
              Використовуйте це поле для перевірки обробки вхідних посилань та навігації всередині застосунку.
            </p>
            <div className="flex space-x-2">
              <Input 
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="shawarma://..."
                className="font-mono text-xs"
              />
              <Button onClick={handleTest}>
                <Send className="w-4 h-4 mr-2" />
                Тест
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 space-y-4">
          <h3 className="font-bold">Приклади URL для перевірки:</h3>
          <ul className="space-y-2">
            {[
              'shawarma://home',
              'shawarma://items/1',
              'shawarma://catalog?filter=Шаурма',
              'shawarma://invite/FRIEND_2024',
              'https://shawarma-express.com/items/2'
            ].map(url => (
              <li key={url} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:border-primary transition-colors cursor-pointer" onClick={() => setTestUrl(url)}>
                <code className="text-xs">{url}</code>
                <ExternalLink className="w-4 h-4 text-text-light" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </MainLayout>
  );
};

export default DebugPage;
