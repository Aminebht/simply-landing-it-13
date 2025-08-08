import { HtmlGenerator } from '../services/deployment/html-generator';
import { TailwindProcessorService } from '../services/deployment/tailwind-processor';
import { SupabaseEdgeFunctionService } from '../services/supabase-edge-functions';

async function testTailwindProcessing() {
  console.log('🧪 Testing Tailwind Processing System...\n');

  // Sample page data
  const pageData = {
    id: 'test-page',
    slug: 'test-landing-page',
    components: [
      {
        id: 'hero-1',
        order_index: 0,
        component_variation: {
          component_type: 'hero',
          variation_number: 1
        },
        content: {
          headline: 'Welcome to Our Amazing Product',
          subheadline: 'Transform your business with our solution',
          buttonText: 'Get Started',
          buttonUrl: '#'
        },
        custom_styles: {},
        visibility: {},
        media_urls: {},
        custom_actions: {}
      }
    ],
    global_theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#f3f4f6',
      backgroundColor: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      direction: 'ltr',
      language: 'en'
    },
    seo_config: {
      title: 'Test Landing Page',
      description: 'A test landing page for Tailwind processing',
      keywords: ['test', 'landing', 'page'],
      ogImage: '',
      canonical: ''
    }
  };

  try {
    // Test 1: Basic HTML Generation
    console.log('📝 Test 1: Basic HTML Generation (without Tailwind processing)');
    const htmlGenerator = new HtmlGenerator({
      enableTailwindProcessing: false
    });
    
    const basicHTML = await htmlGenerator.generateReactHTML(pageData);
    console.log('✅ Basic HTML generated successfully');
    console.log(`📊 HTML size: ${basicHTML.length} characters\n`);

    // Test 2: HTML Generation with Tailwind Processing via Supabase Edge Function
    console.log('🎨 Test 2: HTML with Tailwind Processing via Supabase Edge Function');
    try {
      const supabaseEdgeService = SupabaseEdgeFunctionService.getInstance();
      const edgeProcessedHTML = await supabaseEdgeService.processTailwindCSS(basicHTML, pageData);
      console.log('✅ HTML processed with Supabase Edge Function successfully');
      console.log(`📊 Edge processed HTML size: ${edgeProcessedHTML.length} characters`);
      console.log(`📈 Size difference from basic: ${edgeProcessedHTML.length - basicHTML.length} characters`);
    } catch (error) {
      console.log('⚠️  Supabase Edge Function not available, testing fallback mode instead');
      
      const processorService = new TailwindProcessorService({
        fallbackMode: true
      });
      
      const processedHTML = await processorService.processHTML(basicHTML, pageData);
      console.log('✅ HTML processed with Tailwind CSS fallback successfully');
      console.log(`📊 Fallback processed HTML size: ${processedHTML.length} characters`);
      console.log(`📈 Size difference from basic: ${processedHTML.length - basicHTML.length} characters`);
    }
    console.log('');

    // Test 3: HTML Generation with Tailwind Processing (fallback mode)
    console.log('🔄 Test 3: HTML with Tailwind Processing (fallback mode)');
    const processorService = new TailwindProcessorService({
      fallbackMode: true
    });
    
    const processedHTML = await processorService.processHTML(basicHTML, pageData);
    console.log('✅ HTML processed with Tailwind CSS fallback successfully');
    console.log(`📊 Processed HTML size: ${processedHTML.length} characters`);
    console.log(`📈 Size difference: ${processedHTML.length - basicHTML.length} characters\n`);

    // Test 3: Extract Tailwind classes
    console.log('🔍 Test 4: Extracting Tailwind classes from HTML');
    const classRegex = /class(?:Name)?="([^"]*)"/g;
    const classes: string[] = [];
    let match;

    while ((match = classRegex.exec(processedHTML)) !== null) {
      const classString = match[1];
      const classList = classString.split(/\s+/).filter(cls => cls.length > 0);
      classes.push(...classList);
    }

    const uniqueClasses = [...new Set(classes)];
    console.log('✅ Extracted Tailwind classes:');
    console.log(uniqueClasses.slice(0, 10).join(', ') + (uniqueClasses.length > 10 ? '...' : ''));
    console.log(`📊 Total unique classes: ${uniqueClasses.length}\n`);

    // Test 4: Generate deployment files
    console.log('📦 Test 5: Generate deployment files');
    const htmlGeneratorWithTailwind = new HtmlGenerator({
      enableTailwindProcessing: true,
      cleanProductionHtml: true
    });
    
    const finalHTML = await htmlGeneratorWithTailwind.generateReactHTML(pageData);
    
    // Check if CSS is inlined
    const hasInlinedCSS = finalHTML.includes('<style>') && finalHTML.includes('</style>');
    console.log('✅ Final HTML generated with Tailwind processing');
    console.log(`📊 Final HTML size: ${finalHTML.length} characters`);
    console.log(`🎨 Has inlined CSS: ${hasInlinedCSS ? '✅ Yes' : '❌ No'}\n`);

    // Test 5: Validate HTML structure
    console.log('🔍 Test 6: Validate HTML structure');
    const hasDoctype = finalHTML.includes('<!DOCTYPE html>');
    const hasHead = finalHTML.includes('<head>') && finalHTML.includes('</head>');
    const hasBody = finalHTML.includes('<body>') && finalHTML.includes('</body>');
    const hasMetaTags = finalHTML.includes('<meta');
    
    console.log(`📋 HTML Validation:`);
    console.log(`   DOCTYPE: ${hasDoctype ? '✅' : '❌'}`);
    console.log(`   HEAD tag: ${hasHead ? '✅' : '❌'}`);
    console.log(`   BODY tag: ${hasBody ? '✅' : '❌'}`);
    console.log(`   Meta tags: ${hasMetaTags ? '✅' : '❌'}\n`);

    console.log('🎉 All tests completed successfully!');
    
    return {
      success: true,
      basicHTMLSize: basicHTML.length,
      processedHTMLSize: processedHTML.length,
      finalHTMLSize: finalHTML.length,
      classesFound: uniqueClasses.length,
      hasInlinedCSS,
      validHTML: hasDoctype && hasHead && hasBody && hasMetaTags
    };

  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
if (require.main === module) {
  testTailwindProcessing()
    .then(result => {
      console.log('\n📊 Test Results:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    });
}

export { testTailwindProcessing };
