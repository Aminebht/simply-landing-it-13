import { TailwindProcessorService } from '../services/deployment/tailwind-processor.js';

async function testTailwindProcessor() {
  console.log('🧪 Testing Tailwind Processor Service...\n');

  try {
    const processor = new TailwindProcessorService();
    
    const testHTML = `
      <html>
        <head><title>Test</title></head>
        <body>
          <div class="p-4 bg-blue-500 text-white rounded-lg shadow-md">
            <h1 class="text-2xl font-bold mb-4">Test Content</h1>
            <p class="text-lg">This is a test with Tailwind classes.</p>
          </div>
        </body>
      </html>
    `;

    const pageConfig = {
      global_theme: {
        primaryColor: '#3b82f6',
        secondaryColor: '#f3f4f6',
        backgroundColor: '#ffffff'
      }
    };

    console.log('Input HTML:');
    console.log(testHTML);
    console.log('\nCalling processHTML...');

    const result = await processor.processHTML(testHTML, pageConfig);
    
    console.log('\nProcessed HTML:');
    console.log(result);
    
    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testTailwindProcessor();
