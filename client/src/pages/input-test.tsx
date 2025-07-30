import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function InputTest() {
  const [testInput, setTestInput] = useState('');
  const [vanillaInput, setVanillaInput] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Input Test Page - Debug Text Input Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            
            {/* Test 1: Pure HTML Input */}
            <div>
              <h3 className="text-lg font-bold mb-4">Test 1: Pure HTML Input (No React Hook Form)</h3>
              <input
                type="text"
                value={vanillaInput}
                onChange={(e) => setVanillaInput(e.target.value)}
                placeholder="Type 'Dustin Tyler James' here..."
                className="w-full p-4 border-2 border-gray-300 rounded-lg text-lg"
                style={{
                  fontSize: '18px',
                  padding: '12px',
                  border: '2px solid #ccc',
                  borderRadius: '8px',
                  width: '100%',
                  minHeight: '50px'
                }}
              />
              <p className="mt-2 text-sm text-gray-600">Current value: "{vanillaInput}"</p>
            </div>

            {/* Test 2: Controlled Input with State */}
            <div>
              <h3 className="text-lg font-bold mb-4">Test 2: React Controlled Input</h3>
              <input
                type="text"
                value={testInput}
                onChange={(e) => {
                  console.log('Input change:', e.target.value);
                  setTestInput(e.target.value);
                }}
                onKeyDown={(e) => {
                  console.log('Key down:', e.key);
                }}
                onKeyPress={(e) => {
                  console.log('Key press:', e.key);
                }}
                onInput={(e) => {
                  console.log('Input event:', (e.target as HTMLInputElement).value);
                }}
                placeholder="Type your full name here..."
                className="w-full p-4 border-2 border-blue-500 rounded-lg text-lg focus:outline-none focus:border-blue-700"
              />
              <p className="mt-2 text-sm text-gray-600">Current value: "{testInput}"</p>
            </div>

            {/* Test 3: Textarea */}
            <div>
              <h3 className="text-lg font-bold mb-4">Test 3: Textarea</h3>
              <textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Try typing in this textarea..."
                className="w-full p-4 border-2 border-green-500 rounded-lg text-lg h-24 resize-none"
              />
            </div>

            {/* Test 4: Uncontrolled Input */}
            <div>
              <h3 className="text-lg font-bold mb-4">Test 4: Uncontrolled Input (No React State)</h3>
              <input
                type="text"
                placeholder="Uncontrolled input - try typing..."
                className="w-full p-4 border-2 border-purple-500 rounded-lg text-lg"
                onInput={(e) => {
                  console.log('Uncontrolled input:', (e.target as HTMLInputElement).value);
                }}
              />
            </div>

            {/* Test 5: Different Input Types */}
            <div>
              <h3 className="text-lg font-bold mb-4">Test 5: Different Input Types</h3>
              <div className="space-y-4">
                <input type="email" placeholder="Email input type" className="w-full p-3 border rounded" />
                <input type="tel" placeholder="Tel input type" className="w-full p-3 border rounded" />
                <input type="search" placeholder="Search input type" className="w-full p-3 border rounded" />
              </div>
            </div>

            {/* Debug Info */}
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-bold mb-2">Debug Information:</h3>
              <p>User Agent: {navigator.userAgent}</p>
              <p>Platform: {navigator.platform}</p>
              <p>Language: {navigator.language}</p>
              <p>Cookies Enabled: {navigator.cookieEnabled ? 'Yes' : 'No'}</p>
            </div>

            <div className="text-center">
              <p className="text-lg">
                <strong>Instructions:</strong> Try typing "Dustin Tyler James" in each field above. 
                Check browser console for logs and note which fields work vs don't work.
              </p>
            </div>
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}